// src/utils/business/maintenanceReminder.js
import { listMaintenance } from '@/api/business/maintenance';

class MaintenanceReminderService {
  constructor() {
    this.checkInterval = 60 * 60 * 1000; // 每小时检查一次
    this.timer = null;
    this.isRunning = false;
    this.remindedPlans = new Set(); // 已提醒的计划ID集合
    this.proxy = null;
  }

  // 初始化proxy
  /** 初始化 proxy */
  init(proxy) {
    this.proxy = proxy;
  }

  // 启动服务
  /** 启动服务 */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.timer = setInterval(() => {
      this.checkMaintenancePlans();
    }, this.checkInterval);

    // 立即执行一次
    this.checkMaintenancePlans();
    console.log('维保提醒服务已启动');
  }

  // 停止服务
  /** 停止服务 */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.isRunning = false;
      this.remindedPlans.clear();
      console.log('维保提醒服务已停止');
    }
  }

  // 检查维保计划
  /** 拉取并检查计划 */
  async checkMaintenancePlans() {
    try {
      // 获取已批准且待执行的维保计划
      const response = await listMaintenance({
        approvalStatus: 'approved',
        executionStatus: 'pending',
        pageSize: 100
      });

      const plans = response.rows;
      const now = new Date();

      plans.forEach(plan => {
        if (!plan.nextExecutionTime) return;

        const nextExecution = new Date(plan.nextExecutionTime);
        const diffMinutes = Math.floor((nextExecution - now) / (1000 * 60));

        // 提前24小时、12小时、1小时提醒
        const reminderPoints = [24 * 60, 12 * 60, 60]; // 分钟数

        reminderPoints.forEach(point => {
          if (diffMinutes > 0 && diffMinutes <= point && diffMinutes > point - 60) {
            this.sendReminder(plan, diffMinutes, point);
          }
        });

        // 检查是否逾期
        if (diffMinutes < -60) { // 超过1小时未执行
          this.sendOverdueAlert(plan, -diffMinutes);
        }
      });

      // 清理过期的提醒记录
      this.cleanExpiredReminders();

    } catch (error) {
      console.error('检查维保计划失败:', error);
      this.notifyError(error);
    }
  }

  // 发送提醒
  /** 发送即将到期提醒 */
  sendReminder(plan, minutesLeft, reminderPoint) {
    const remindKey = `${plan.planId}-${reminderPoint}-${plan.nextExecutionTime}`;

    // 避免重复提醒
    if (this.remindedPlans.has(remindKey)) return;

    const message = `维保计划"${plan.title}"将在${this.formatTime(minutesLeft)}后执行`;

    if (this.proxy && this.proxy.$modal) {
      this.proxy.$modal.msgWarning(message);
    }

    this.remindedPlans.add(remindKey);

    // 记录提醒日志
    console.log(`[维保提醒] ${message}`);
  }

  // 发送逾期告警
  /** 发送逾期告警 */
  sendOverdueAlert(plan, overdueMinutes) {
    const alertKey = `overdue-${plan.planId}-${new Date().toDateString()}`;

    // 每天只提醒一次
    if (this.remindedPlans.has(alertKey)) return;

    const message = `维保计划"${plan.title}"已逾期${this.formatTime(overdueMinutes)}未执行，请尽快处理！`;

    if (this.proxy && this.proxy.$modal) {
      this.proxy.$modal.msgError(message);
    }

    this.remindedPlans.add(alertKey);

    // 记录告警日志
    console.error(`[维保逾期] ${message}`);
  }

  // 格式化时间
  /** 格式化分钟为友好文本 */
  formatTime(minutes) {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours < 24) {
      return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
    }

    const days = Math.floor(hours / 24);
    const restHours = hours % 24;

    if (restHours > 0) {
      return `${days}天${restHours}小时`;
    }
    return `${days}天`;
  }

  // 清理过期的提醒记录
  /** 清理过期提醒键 */
  cleanExpiredReminders() {
    const now = new Date();
    const today = now.toDateString();
    const expiredKeys = [];

    this.remindedPlans.forEach(key => {
      // 清理非今天的逾期告警
      if (key.startsWith('overdue-') && !key.includes(today)) {
        expiredKeys.push(key);
      }

      // 清理已过期的常规提醒
      const parts = key.split('-');
      if (parts.length >= 3) {
        const timeStr = parts.slice(2).join('-');
        const planTime = new Date(timeStr);
        if (now > planTime) {
          expiredKeys.push(key);
        }
      }
    });

    expiredKeys.forEach(key => {
      this.remindedPlans.delete(key);
    });
  }

  // 错误通知
  /** 错误通知 */
  notifyError(error) {
    if (this.proxy && this.proxy.$modal) {
      this.proxy.$modal.msgError('维保提醒服务异常：' + (error.message || '请检查系统日志'));
    }
  }

  // 获取服务状态
  /** 获取当前状态 */
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      remindedCount: this.remindedPlans.size,
      nextCheckTime: this.timer ? new Date(Date.now() + this.checkInterval) : null
    };
  }

  // 手动触发检查
  /** 手动触发一次检查 */
  async manualCheck() {
    console.log('手动触发维保计划检查');
    await this.checkMaintenancePlans();
    return {
      success: true,
      message: '检查完成',
      timestamp: new Date()
    };
  }
}

// 导出单例
export default new MaintenanceReminderService();