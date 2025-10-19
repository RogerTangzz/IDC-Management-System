#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
机柜U位数据初始化脚本
为每个机柜创建对应数量的U位记录
"""

import pymysql
from datetime import datetime

# 数据库配置
DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'idc_app',
    'password': 'appPwd',
    'database': 'idc_clean',
    'charset': 'utf8mb4'
}

def init_u_slots():
    """初始化U位数据"""
    conn = None
    try:
        # 连接数据库
        print("连接数据库...")
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # 清空现有U位数据
        print("清空现有U位数据...")
        cursor.execute("TRUNCATE TABLE biz_rack_u_slot")
        conn.commit()

        # 查询所有有效机柜
        print("查询机柜列表...")
        cursor.execute("""
            SELECT rack_id, rack_no, rack_name, u_count
            FROM biz_asset_rack
            WHERE del_flag = '0'
            ORDER BY rack_id
        """)
        racks = cursor.fetchall()
        print(f"找到 {len(racks)} 个机柜")

        # 为每个机柜创建U位记录
        total_slots = 0
        for rack_id, rack_no, rack_name, u_count in racks:
            print(f"初始化机柜 {rack_no} ({rack_name}): {u_count} 个U位...")

            # 批量插入U位记录
            slots_data = []
            for u_num in range(1, u_count + 1):
                slots_data.append((
                    rack_id,
                    u_num,
                    'free',
                    '0',
                    'system',
                    datetime.now()
                ))

            # 批量插入
            cursor.executemany("""
                INSERT INTO biz_rack_u_slot
                (rack_id, u_number, status, del_flag, create_by, create_time)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, slots_data)

            total_slots += u_count

        # 提交事务
        conn.commit()
        print(f"\n✅ 初始化完成! 共创建 {total_slots} 条U位记录")

        # 统计结果
        cursor.execute("""
            SELECT
                COUNT(*) AS total_u_slots,
                COUNT(DISTINCT rack_id) AS rack_count,
                SUM(CASE WHEN status='free' THEN 1 ELSE 0 END) AS free_slots,
                SUM(CASE WHEN status='occupied' THEN 1 ELSE 0 END) AS occupied_slots
            FROM biz_rack_u_slot
        """)
        stats = cursor.fetchone()
        print(f"\n📊 统计信息:")
        print(f"   总U位数: {stats[0]}")
        print(f"   机柜数: {stats[1]}")
        print(f"   空闲U位: {stats[2]}")
        print(f"   已占用: {stats[3]}")

        # 查看前10个机柜的U位分布
        cursor.execute("""
            SELECT
                r.rack_no,
                r.rack_name,
                r.u_count AS total_u,
                COUNT(s.slot_id) AS initialized_u
            FROM biz_asset_rack r
            LEFT JOIN biz_rack_u_slot s ON r.rack_id = s.rack_id AND s.del_flag='0'
            WHERE r.del_flag='0'
            GROUP BY r.rack_id, r.rack_no, r.rack_name, r.u_count
            ORDER BY r.rack_no
            LIMIT 10
        """)

        print(f"\n📋 前10个机柜U位分布:")
        print(f"{'机柜编号':<15} {'机柜名称':<25} {'总U数':>8} {'已初始化':>10}")
        print("-" * 65)
        for row in cursor.fetchall():
            rack_no, rack_name, total_u, init_u = row
            print(f"{rack_no:<15} {rack_name:<25} {total_u:>8} {init_u:>10}")

    except Exception as e:
        print(f"❌ 错误: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()
            print("\n数据库连接已关闭")

if __name__ == '__main__':
    init_u_slots()
