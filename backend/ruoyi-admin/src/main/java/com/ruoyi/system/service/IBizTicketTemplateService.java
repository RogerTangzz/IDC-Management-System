package com.ruoyi.system.service;

import java.util.List;
import com.ruoyi.system.domain.BizTicketTemplate;

/**
 * 工单模板Service接口
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
public interface IBizTicketTemplateService 
{
    /**
     * 查询工单模板
     * 
     * @param templateId 工单模板主键
     * @return 工单模板
     */
    public BizTicketTemplate selectBizTicketTemplateByTemplateId(Long templateId);

    /**
     * 查询工单模板列表
     * 
     * @param bizTicketTemplate 工单模板
     * @return 工单模板集合
     */
    public List<BizTicketTemplate> selectBizTicketTemplateList(BizTicketTemplate bizTicketTemplate);

    /**
     * 新增工单模板
     * 
     * @param bizTicketTemplate 工单模板
     * @return 结果
     */
    public int insertBizTicketTemplate(BizTicketTemplate bizTicketTemplate);

    /**
     * 修改工单模板
     * 
     * @param bizTicketTemplate 工单模板
     * @return 结果
     */
    public int updateBizTicketTemplate(BizTicketTemplate bizTicketTemplate);

    /**
     * 批量删除工单模板
     * 
     * @param templateIds 需要删除的工单模板主键集合
     * @return 结果
     */
    public int deleteBizTicketTemplateByTemplateIds(Long[] templateIds);

    /**
     * 删除工单模板信息
     * 
     * @param templateId 工单模板主键
     * @return 结果
     */
    public int deleteBizTicketTemplateByTemplateId(Long templateId);
}
