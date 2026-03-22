package com.otakusaikou.strata.authentication.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.otakusaikou.strata.authentication.infrastructure.persistence.entity.RefreshSessionEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface RefreshSessionMapper extends BaseMapper<RefreshSessionEntity> {
}
