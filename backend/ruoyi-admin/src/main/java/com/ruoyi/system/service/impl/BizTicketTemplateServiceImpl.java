package com.ruoyi.system.service.impl;

import java.util.List;
import com.ruoyi.common.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.BizTicketTemplateMapper;
import com.ruoyi.system.domain.BizTicketTemplate;
import com.ruoyi.system.service.IBizTicketTemplateService;

/**
 * 工单模板Service业务层处理
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
@Service
public class BizTicketTemplateServiceImpl implements IBizTicketTemplateService 
{
    @Autowired
    private BizTicketTemplateMapper bizTicketTemplateMapper;

    /**
     * 查询工单模板
     * 
     * @param templateId 工单模板主键
     * @return 工单模板
     */
    @Override
    public BizTicketTemplate selectBizTicketTemplateByTemplateId(Long templateId)
    {
        return bizTicketTemplateMapper.selectBizTicketTemplateByTemplateId(templateId);
    }

    /**
     * 查询工单模板列表
     * 
     * @param bizTicketTemplate 工单模板
     * @return 工单模板
     */
    @Override
    public List<BizTicketTemplate> selectBizTicketTemplateList(BizTicketTemplate bizTicketTemplate)
    {
        return bizTicketTemplateMapper.selectBizTicketTemplateList(bizTicketTemplate);
    }

    /**
     * 新增工单模板
     * 
     * @param bizTicketTemplate 工单模板
     * @return 结果
     */
    @Override
    public int insertBizTicketTemplate(BizTicketTemplate bizTicketTemplate)
    {
        bizTicketTemplate.setCreateTime(DateUtils.getNowDate());
        return bizTicketTemplateMapper.insertBizTicketTemplate(bizTicketTemplate);
    }

    /**
     * 修改工单模板
     * 
     * @param bizTicketTemplate 工单模板
     * @return 结果
     */
    @Override
    public int updateBizTicketTemplate(BizTicketTemplate bizTicketTemplate)
    {
        bizTicketTemplate.setUpdateTime(DateUtils.getNowDate());
        return bizTicketTemplateMapper.updateBizTicketTemplate(bizTicketTemplate);
    }

    /**
     * 批量删除工单模板
     * 
     * @param templateIds 需要删除的工单模板主键
     * @return 结果
     */
    @Override
    public int deleteBizTicketTemplateByTemplateIds(Long[] templateIds)
    {
        return bizTicketTemplateMapper.deleteBizTicketTemplateByTemplateIds(templateIds);
    }

    /**
     * 删除工单模板信息
     * 
     * @param templateId 工单模板主键
     * @return 结果
     */
    @Override
    public int deleteBizTicketTemplateByTemplateId(Long templateId)
    {
        return bizTicketTemplateMapper.deleteBizTicketTemplateByTemplateId(templateId);
    }
}
