/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of database cardcool
# ------------------------------------------------------------

DROP DATABASE IF EXISTS `cardcool`;

CREATE DATABASE `cardcool` DEFAULT CHARACTER SET = `utf8mb4`;

USE `cardcool`;

CREATE TABLE `card` (
  `unid` int unsigned NOT NULL AUTO_INCREMENT,
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT '用户id',
  `id` varchar(12) NOT NULL DEFAULT '' COMMENT 'id',
  `space_id` varchar(12) NOT NULL DEFAULT '' COMMENT '空间 id',
  `type_id` varchar(12) NOT NULL DEFAULT '' COMMENT '类型 id',
  `name` varchar(64) NOT NULL DEFAULT '' COMMENT '名称',
  `tags` varchar(128) NOT NULL DEFAULT '[]' COMMENT '标签',
  `props` varchar(1024) NOT NULL DEFAULT '' COMMENT '属性值',
  `content` varchar(2048) NOT NULL DEFAULT '' COMMENT '属性值',
  `create_time` int unsigned NOT NULL DEFAULT '0' COMMENT '创建时间(s)',
  `update_time` bigint unsigned NOT NULL DEFAULT '0' COMMENT '更新时间(ms)',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除状态，0-正常，1-已删除',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除状态，0-正常，1-已删除',
  PRIMARY KEY (`unid`),
  UNIQUE KEY `idx_uid_id` (`uid`,`id`),
  KEY `idx_uid_update_time` (`uid`,`update_time`)
) ENGINE=InnoDB COMMENT='卡片表';

INSERT INTO `card` (`uid`, `id`, `space_id`, `type_id`, `name`, `tags`, `props`, `content`, `create_time`, `update_time`, `is_deleted`, `deleted`)
VALUES
	(1, 'U8QjJnYS69XS', 'U8QjJnOEulR5', 'U8QjJnPAhsmH', '唐僧', '[]', '{\"TdqTDfDqrVq_\":\"0602-01-01\",\"TdqTMYfggFt_\":\"19999999999\",\"TdqTQeDUqLt_\":\"TdqTbxOTtfH_\",\"TdqTLBKlOZl_\":\"东土大唐净土寺\",\"links\":[\"U8QjJnZ5284h\"]}', '{\"type\":\"doc\",\"content\":[{\"type\":\"blockquote\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"社会我唐哥，人狠话又多\"}]}]},{\"type\":\"nbl\",\"content\":[{\"type\":\"nli\",\"attrs\":{\"coll\":false},\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"背景：如来佛祖二弟子\"}]}]},{\"type\":\"nli\",\"attrs\":{\"coll\":false},\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"经历：和 \"},{\"type\":\"mention\",\"attrs\":{\"id\":\"U8QjJnZ5284h\",\"label\":\"孙悟空\",\"type\":1,\"icon\":\"card\"}},{\"type\":\"text\",\"text\":\" 等西天取经，历经九九八十一难，终成正果\"}]}]}]}]}', 0, 1711731115780, 0, 0),
	(1, 'U8QjJnZ5284h', 'U8QjJnOEulR5', 'U8QjJnPAhsmH', '孙悟空', '[]', '{\"TdqTDfDqrVq_\":\"0101-01-01\",\"TdqTMYfggFt_\":\"16666666666\",\"TdqTQeDUqLt_\":\"TdqTcWLVedx_\",\"TdqTLBKlOZl_\":\"花果山水帘洞\",\"links\":[\"U8QjJnYS69XS\"]}', '{\"type\":\"doc\",\"content\":[{\"type\":\"blockquote\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"猴哥猴哥，你真了不得！\"}]}]},{\"type\":\"nbl\",\"content\":[{\"type\":\"nli\",\"attrs\":{\"coll\":false},\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"护送 \"},{\"type\":\"mention\",\"attrs\":{\"id\":\"U8QjJnYS69XS\",\"label\":\"唐僧\",\"type\":1,\"icon\":\"card\"}},{\"type\":\"text\",\"text\":\" 西天取经，降妖除魔，历经九九八十一难，终成正果，封\"},{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"斗战神佛\"},{\"type\":\"text\",\"text\":\"！\"}]}]}]}]}', 0, 1711731115781, 0, 0),
	(1, 'U8QjJna22vQv', 'U8QjJnOEulR5', 'U8QjJnQkcD2Z', '西游第一日', '[]', '{\"U0gWTEhJkRJ_\":\"0629-06-06\",\"links\":[\"U8QjJnYS69XS\",\"U8QjJnZ5284h\"]}', '{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"净业寺里， \"},{\"type\":\"mention\",\"attrs\":{\"id\":\"U8QjJnYS69XS\",\"label\":\"唐僧\",\"type\":1,\"icon\":\"card\"}},{\"type\":\"text\",\"text\":\" 与 \"},{\"type\":\"mention\",\"attrs\":{\"id\":\"U8QjJnZ5284h\",\"label\":\"孙悟空\",\"type\":1,\"icon\":\"card\"}},{\"type\":\"text\",\"text\":\" 对视一笑，眼中藏着迷人的火光。\"}]},{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"猪八戒嘴角挑起，歪嘴邪笑，沙悟净则俏皮地眨眼。\"}]},{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"一场禁忌的邂逅，心跳不已。\"}]},{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"唐僧心头涌起莫名的悸动，四人的相遇，注定要引发一场爱的冒险。\"}]}]}', 0, 1711731115782, 0, 0);

# Dump of table card
# ------------------------------------------------------------

DROP TABLE IF EXISTS `card`;

CREATE TABLE `card` (
  `unid` int unsigned NOT NULL AUTO_INCREMENT,
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT '用户id',
  `id` varchar(12) NOT NULL DEFAULT '' COMMENT 'id',
  `space_id` varchar(12) NOT NULL DEFAULT '' COMMENT '空间 id',
  `type_id` varchar(12) NOT NULL DEFAULT '' COMMENT '类型 id',
  `name` varchar(64) NOT NULL DEFAULT '' COMMENT '名称',
  `tags` varchar(128) NOT NULL DEFAULT '[]' COMMENT '标签',
  `props` varchar(1024) NOT NULL DEFAULT '' COMMENT '属性值',
  `content` varchar(2048) NOT NULL DEFAULT '' COMMENT '属性值',
  `create_time` int unsigned NOT NULL DEFAULT '0' COMMENT '创建时间(s)',
  `update_time` bigint unsigned NOT NULL DEFAULT '0' COMMENT '更新时间(ms)',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除状态，0-正常，1-已删除',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除状态，0-正常，1-已删除',
  PRIMARY KEY (`unid`),
  UNIQUE KEY `idx_uid_id` (`uid`,`id`),
  KEY `idx_uid_update_time` (`uid`,`update_time`)
) ENGINE=InnoDB COMMENT='卡片表';



# Dump of table filelog
# ------------------------------------------------------------

DROP TABLE IF EXISTS `filelog`;

CREATE TABLE `filelog` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT '用户 id',
  `hash` varchar(28) NOT NULL DEFAULT '' COMMENT '文件 hash',
  `size` int unsigned NOT NULL DEFAULT '0' COMMENT '文件大小(B)',
  `create_time` int unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_hash` (`hash`),
  KEY `idx_uid_size` (`uid`,`size`)
) ENGINE=InnoDB COMMENT='文件上传记录表';



# Dump of table invite
# ------------------------------------------------------------

DROP TABLE IF EXISTS `invite`;

CREATE TABLE `invite` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(12) NOT NULL DEFAULT '' COMMENT '邀请码',
  `limit_type` tinyint NOT NULL DEFAULT '0' COMMENT '类型：0-无限制，1-一次性',
  `start_time` int unsigned NOT NULL DEFAULT '0' COMMENT '开始时间',
  `end_time` int unsigned NOT NULL DEFAULT '0' COMMENT '截止时间',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '状态，0-正常，-1-已删除',
  `create_uid` int unsigned NOT NULL DEFAULT '0' COMMENT '创建邀请码的用户 id',
  `create_time` int unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_time` int unsigned NOT NULL DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_code` (`code`),
  KEY `idx_create_uid` (`create_uid`)
) ENGINE=InnoDB COMMENT='邀请码表';



# Dump of table propext
# ------------------------------------------------------------

DROP TABLE IF EXISTS `propext`;

CREATE TABLE `propext` (
  `unid` int unsigned NOT NULL AUTO_INCREMENT,
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT '用户id',
  `id` varchar(12) NOT NULL DEFAULT '' COMMENT 'id',
  `type_id` tinyint(1) NOT NULL DEFAULT '1' COMMENT '扩展信息类型，1-props,2-content',
  `props` text NOT NULL COMMENT '扩展属性值',
  PRIMARY KEY (`unid`),
  UNIQUE KEY `idx_uid_id_type` (`uid`,`id`,`type_id`)
) ENGINE=InnoDB COMMENT='属性扩展表';

INSERT INTO `propext` (`uid`, `id`, `type_id`, `props`)
VALUES
	(1, 'U8QjJniSBGWq', 9, '{\"type\":\"doc\",\"content\":[{\"type\":\"blockquote\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"问题反馈、意见建议、学习交流，欢迎加开发者微信（\"},{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"cardcool666\"},{\"type\":\"text\",\"text\":\"）\"}]}]},{\"type\":\"heading\",\"attrs\":{\"level\":3},\"content\":[{\"type\":\"text\",\"text\":\"文档基本功能\"}]},{\"type\":\"nbl\",\"content\":[{\"type\":\"nli\",\"attrs\":{\"coll\":false},\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"支持常用 \"},{\"type\":\"text\",\"marks\":[{\"type\":\"code\"}],\"text\":\"Markdown\"},{\"type\":\"text\",\"text\":\" 语法\"}]}]},{\"type\":\"nli\",\"attrs\":{\"coll\":false},\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"使用 \"},{\"type\":\"text\",\"marks\":[{\"type\":\"code\"}],\"text\":\"/\"},{\"type\":\"text\",\"text\":\" 可唤起命令\"}]}]},{\"type\":\"nli\",\"attrs\":{\"coll\":false},\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"选中文本可弹窗浮动菜单，修改文本样式\"}]}]},{\"type\":\"nli\",\"attrs\":{\"coll\":false},\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"输入 \"},{\"type\":\"text\",\"marks\":[{\"type\":\"code\"}],\"text\":\"@+关键词\"},{\"type\":\"text\",\"text\":\" 可引用卡片或其他视图， \"},{\"type\":\"mention\",\"attrs\":{\"id\":\"U8QjJnZ5284h\",\"label\":\"孙悟空\",\"type\":1,\"icon\":\"card\"}},{\"type\":\"text\",\"text\":\" \"}]}]}]},{\"type\":\"heading\",\"attrs\":{\"level\":3},\"content\":[{\"type\":\"text\",\"text\":\"功能规划\"}]},{\"type\":\"nbl\",\"content\":[{\"type\":\"nli\",\"attrs\":{\"coll\":false},\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"更完善的编辑体验\"}]}]},{\"type\":\"nli\",\"attrs\":{\"coll\":false},\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"文档、大纲、白板、看板多种视图融合，可在一个页面同时打开多个视图\"}]}]},{\"type\":\"nli\",\"attrs\":{\"coll\":false},\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"面向应用场景进行功能迭代…\"}]}]}]},{\"type\":\"paragraph\"},{\"type\":\"paragraph\"}]}');


# Dump of table share
# ------------------------------------------------------------

DROP TABLE IF EXISTS `share`;

CREATE TABLE `share` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(24) NOT NULL DEFAULT '' COMMENT 'uuid',
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT '用户id',
  `view_id` varchar(12) NOT NULL DEFAULT '' COMMENT '视图 id',
  `name` varchar(32) NOT NULL DEFAULT '' COMMENT '名称',
  `type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '视图类型: 0-List, 1-Graph',
  `icon` varchar(16) NOT NULL DEFAULT '' COMMENT 'Icon',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态: 0-失效, 1-有效',
  `content` text NOT NULL COMMENT '视图内容',
  `create_time` int unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_time` int unsigned NOT NULL DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_uuid` (`uuid`),
  UNIQUE KEY `idx_uid_view_id` (`uid`,`view_id`)
) ENGINE=InnoDB COMMENT='视图分享表';



# Dump of table space
# ------------------------------------------------------------

DROP TABLE IF EXISTS `space`;

CREATE TABLE `space` (
  `unid` int unsigned NOT NULL AUTO_INCREMENT,
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT '用户id',
  `id` varchar(12) NOT NULL DEFAULT '' COMMENT '用户的空间id',
  `name` varchar(32) NOT NULL DEFAULT '' COMMENT '空间名称',
  `icon` varchar(16) NOT NULL DEFAULT '' COMMENT 'Icon',
  `desc` varchar(128) NOT NULL DEFAULT '' COMMENT '说明',
  `snum` int unsigned NOT NULL DEFAULT '0' COMMENT '排序序号',
  `update_time` bigint unsigned NOT NULL DEFAULT '0' COMMENT '更新时间(ms)',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除状态，0-正常，1-已删除',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除状态，0-正常，1-已删除',
  PRIMARY KEY (`unid`),
  UNIQUE KEY `idx_uid_id` (`uid`,`id`),
  KEY `idx_uid_update_time` (`uid`,`update_time`)
) ENGINE=InnoDB COMMENT='空间表';

INSERT INTO `space` (`uid`, `id`, `name`, `icon`, `desc`, `snum`, `update_time`, `is_deleted`, `deleted`)
VALUES
	(1, 'U8QjJnOEulR5', '默认空间', 'planet', '你的默认卡片空间！', 10000, 1711731115770, 0, 0);


# Dump of table tag
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tag`;

CREATE TABLE `tag` (
  `unid` int unsigned NOT NULL AUTO_INCREMENT,
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT '用户 id',
  `id` varchar(12) NOT NULL DEFAULT '' COMMENT '标签 id',
  `name` varchar(32) NOT NULL DEFAULT '' COMMENT '标签名称',
  `space_id` varchar(12) NOT NULL DEFAULT '' COMMENT '空间 id',
  `pid` varchar(12) NOT NULL DEFAULT '' COMMENT '父级标签 id',
  `color` varchar(12) NOT NULL DEFAULT '' COMMENT '颜色',
  `snum` int unsigned NOT NULL DEFAULT '0' COMMENT '排序序号',
  `update_time` bigint unsigned NOT NULL DEFAULT '0' COMMENT '更新时间(ms)',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除状态，0-正常，1-已删除',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除状态，0-正常，1-已删除',
  PRIMARY KEY (`unid`),
  UNIQUE KEY `idx_uid_id` (`uid`,`id`),
  KEY `idx_uid_update_time` (`uid`,`update_time`)
) ENGINE=InnoDB COMMENT='标签表';



# Dump of table type
# ------------------------------------------------------------

DROP TABLE IF EXISTS `type`;

CREATE TABLE `type` (
  `unid` int unsigned NOT NULL AUTO_INCREMENT,
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT '用户id',
  `id` varchar(12) NOT NULL DEFAULT '' COMMENT 'id',
  `name` varchar(32) NOT NULL DEFAULT '' COMMENT '名称',
  `icon` varchar(16) NOT NULL DEFAULT '' COMMENT '类型 Icon',
  `snum` int unsigned NOT NULL DEFAULT '0' COMMENT '排序序号',
  `props` varchar(4096) NOT NULL DEFAULT '' COMMENT '类型属性',
  `styles` varchar(4096) NOT NULL DEFAULT '' COMMENT '卡片样式',
  `desc` varchar(128) NOT NULL DEFAULT '' COMMENT '类型说明',
  `update_time` bigint unsigned NOT NULL DEFAULT '0' COMMENT '更新时间(ms)',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除状态，0-正常，1-已删除',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除状态，0-正常，1-已删除',
  PRIMARY KEY (`unid`),
  UNIQUE KEY `idx_uid_id` (`uid`,`id`),
  KEY `idx_uid_update_time` (`uid`,`update_time`)
) ENGINE=InnoDB COMMENT='节点类型表';

INSERT INTO `type` (`uid`, `id`, `name`, `icon`, `snum`, `props`, `styles`, `desc`, `update_time`, `is_deleted`, `deleted`)
VALUES
	(1, 'U8QjJnPAhsmH', '人物卡', 'dup', 0, '[{\"id\":\"name\",\"name\":\"人物名称\",\"nameType\":1,\"type\":\"name\",\"defaultVal\":\"\",\"hide\":0,\"handles\":[\"copy\"],\"show\":[],\"options\":[],\"layout\":{\"i\":\"name\",\"w\":6,\"h\":1,\"x\":0,\"y\":0,\"minW\":3,\"maxH\":1,\"static\":true}},{\"id\":\"tags\",\"name\":\"标签\",\"nameType\":1,\"type\":\"tags\",\"defaultVal\":[],\"hide\":0,\"handles\":[],\"show\":[],\"options\":[],\"layout\":{\"i\":\"tags\",\"w\":6,\"h\":1,\"x\":0,\"y\":1,\"minW\":3,\"maxH\":1,\"static\":false}},{\"id\":\"TdqTDfDqrVq_\",\"name\":\"生日\",\"nameType\":0,\"type\":\"date\",\"defaultVal\":\"\",\"hide\":0,\"handles\":[\"copy\"],\"show\":[\"inline\"],\"layout\":{\"i\":\"TdqTDfDqrVq_\",\"w\":6,\"h\":1,\"x\":0,\"y\":2,\"minW\":3,\"maxH\":1,\"static\":false}},{\"id\":\"TdqTMYfggFt_\",\"name\":\"手机\",\"type\":\"phone\",\"handles\":[\"copy\"],\"show\":[\"inline\"],\"nameType\":0,\"defaultVal\":\"\",\"hide\":0,\"layout\":{\"i\":\"TdqTMYfggFt_\",\"w\":6,\"h\":1,\"x\":0,\"y\":3,\"minW\":3,\"maxH\":1,\"static\":false}},{\"id\":\"TdqTQeDUqLt_\",\"name\":\"关系\",\"type\":\"select\",\"options\":[{\"id\":\"TdqTbxOTtfH_\",\"label\":\"亲人\",\"color\":\"#ff5722\"},{\"id\":\"TdqTcWLVedx_\",\"label\":\"朋友\",\"color\":\"#03a9f4\"},{\"id\":\"TdqTdzCrqtM_\",\"label\":\"同事\",\"color\":\"#4caf50\"}],\"nameType\":0,\"defaultVal\":\"TdqTcWLVedx_\",\"hide\":0,\"layout\":{\"i\":\"TdqTQeDUqLt_\",\"w\":6,\"h\":1,\"x\":0,\"y\":4,\"minW\":3,\"maxH\":1,\"static\":false}},{\"id\":\"TdqTLBKlOZl_\",\"name\":\"地址\",\"type\":\"text\",\"handles\":[\"copy\"],\"show\":[\"inline\"],\"nameType\":0,\"defaultVal\":\"\",\"hide\":0,\"layout\":{\"i\":\"TdqTLBKlOZl_\",\"w\":6,\"h\":1,\"x\":0,\"y\":5,\"minW\":3,\"maxH\":1,\"static\":false}},{\"id\":\"content\",\"name\":\"人物事件\",\"nameType\":1,\"type\":\"content\",\"defaultVal\":null,\"hide\":0,\"handles\":[],\"show\":[],\"options\":[],\"layout\":{\"i\":\"content\",\"w\":6,\"h\":6,\"x\":0,\"y\":6,\"minW\":3,\"maxH\":11,\"static\":false}}]', '[]', '人物信息卡片', 1711731115771, 0, 0),
	(1, 'U8QjJnQkcD2Z', '日记卡', 'dup', 0, '[{\"id\":\"name\",\"name\":\"日记名\",\"nameType\":1,\"type\":\"name\",\"defaultVal\":\"{$d}\",\"hide\":0,\"handles\":[\"copy\"],\"show\":[],\"options\":[],\"layout\":{\"i\":\"name\",\"w\":6,\"h\":1,\"x\":0,\"y\":0,\"minW\":3,\"maxH\":1}},{\"id\":\"tags\",\"name\":\"标签\",\"nameType\":1,\"type\":\"tags\",\"defaultVal\":[],\"hide\":0,\"handles\":[],\"show\":[],\"options\":[],\"layout\":{\"i\":\"tags\",\"w\":6,\"h\":1,\"x\":0,\"y\":1,\"minW\":3,\"maxH\":1}},{\"id\":\"U0gWTEhJkRJ_\",\"name\":\"日期\",\"nameType\":0,\"type\":\"date\",\"defaultVal\":\"{$d}\",\"hide\":0,\"handles\":[\"copy\"],\"show\":[],\"options\":[],\"layout\":{\"i\":\"U0gWTEhJkRJ_\",\"w\":6,\"h\":1,\"x\":0,\"y\":2,\"minW\":3,\"maxH\":1}},{\"id\":\"content\",\"name\":\"日记内容\",\"nameType\":1,\"type\":\"content\",\"defaultVal\":null,\"hide\":0,\"handles\":[],\"show\":[],\"options\":[],\"layout\":{\"i\":\"content\",\"w\":6,\"h\":9,\"x\":0,\"y\":3,\"minW\":6,\"maxH\":11}}]', '[]', '每日记录、思考与总结', 1711731115772, 0, 0);


# Dump of table user
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `mobile` varchar(16) NOT NULL DEFAULT '' COMMENT '用户手机号码',
  `openid` varchar(32) NOT NULL DEFAULT '' COMMENT 'openid',
  `unionid` varchar(32) NOT NULL DEFAULT '' COMMENT 'unionid',
  `username` varchar(32) NOT NULL DEFAULT '' COMMENT '用户名',
  `avatar` varchar(256) NOT NULL DEFAULT '' COMMENT '头像',
  `password` varchar(32) NOT NULL DEFAULT '' COMMENT '用户密码',
  `dbpassword` varchar(32) NOT NULL DEFAULT '' COMMENT '本地数据库密码(不能改变)',
  `code` varchar(12) NOT NULL DEFAULT '' COMMENT '唯一邀请码',
  `pid` int unsigned NOT NULL DEFAULT '0' COMMENT '邀请者 uid',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '状态，0-正常，-1-已删除',
  `config` varchar(2048) NOT NULL DEFAULT '' COMMENT '配置信息',
  `create_time` int unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_time` int unsigned NOT NULL DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_code` (`code`),
  KEY `idx_pid` (`pid`),
  KEY `idx_mobile` (`mobile`),
  KEY `idx_openid` (`openid`),
  KEY `idx_unionid` (`unionid`)
) ENGINE=InnoDB COMMENT='用户账号表';

INSERT INTO `user` (`mobile`, `openid`, `unionid`, `username`, `avatar`, `password`, `dbpassword`, `code`, `pid`, `status`, `config`, `create_time`, `update_time`)
VALUES
	('00000000000', '', '', '默认用户', '/cc/icon.png', '84f3af15562aa32a475c8aff86f486f1', '154a42ba4f9c714c24c425f03031df63', 'WELCOMECCOOL', 0, 0, '{}', 1711731115, 1711731115);


# Dump of table view
# ------------------------------------------------------------

DROP TABLE IF EXISTS `view`;

CREATE TABLE `view` (
  `unid` int unsigned NOT NULL AUTO_INCREMENT,
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT '用户id',
  `id` varchar(12) NOT NULL DEFAULT '' COMMENT 'id',
  `name` varchar(32) NOT NULL DEFAULT '' COMMENT '名称',
  `space_id` varchar(12) NOT NULL DEFAULT '' COMMENT '空间 id',
  `pid` varchar(12) NOT NULL DEFAULT '' COMMENT '父级 id',
  `snum` int unsigned NOT NULL DEFAULT '0' COMMENT '排序序号',
  `type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '视图类型: 视图类型: 0-List，1-Graph',
  `inline_type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '内联类型: 0-非内联，1-内联',
  `is_favor` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否收藏: 0-否，1-是',
  `icon` varchar(16) NOT NULL DEFAULT '' COMMENT 'Icon',
  `desc` varchar(128) NOT NULL DEFAULT '' COMMENT '说明',
  `config` varchar(2048) NOT NULL DEFAULT '' COMMENT '视图配置信息',
  `update_time` bigint unsigned NOT NULL DEFAULT '0' COMMENT '更新时间(ms)',
  `is_deleted` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '逻辑删除状态，0-正常，1-已删除',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除状态，0-正常，1-已删除',
  PRIMARY KEY (`unid`),
  UNIQUE KEY `idx_uid_id` (`uid`,`id`),
  KEY `idx_uid_update_time` (`uid`,`update_time`)
) ENGINE=InnoDB COMMENT='视图表';

INSERT INTO `view` (`uid`, `id`, `name`, `space_id`, `pid`, `snum`, `type`, `inline_type`, `is_favor`, `icon`, `desc`, `config`, `update_time`, `is_deleted`, `deleted`)
VALUES
	(1, 'U8QjJniSBGWq', '文档草稿', 'U8QjJnOEulR5', '', 10000, 4, 0, 1, 'doc', '无压输入，定期整理', '{\"ruleId\":\"\",\"rules\":[]}', 1711731115790, 0, 0),
	(1, 'U8QjJnjOP8PW', '白板草稿', 'U8QjJnOEulR5', '', 20000, 1, 0, 1, 'board', '视觉化笔记，自由组织信息', '{\"ruleId\":\"\",\"rules\":[]}', 1711731115791, 0, 0);


# Dump of table viewedge
# ------------------------------------------------------------

DROP TABLE IF EXISTS `viewedge`;

CREATE TABLE `viewedge` (
  `unid` int unsigned NOT NULL AUTO_INCREMENT,
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT '用户id',
  `id` varchar(12) NOT NULL DEFAULT '' COMMENT 'id',
  `view_id` varchar(12) NOT NULL DEFAULT '' COMMENT '视图 id',
  `source` varchar(12) NOT NULL DEFAULT '' COMMENT '源节点 id',
  `target` varchar(12) NOT NULL DEFAULT '' COMMENT '目标节点 id',
  `source_handle` char(2) NOT NULL DEFAULT '' COMMENT '源节点连接 handle',
  `target_handle` char(2) NOT NULL DEFAULT '' COMMENT '目标节点连接 handle',
  `ve_type_id` varchar(12) NOT NULL DEFAULT '' COMMENT '视图边类型 id',
  `name` varchar(32) NOT NULL DEFAULT '' COMMENT '名称',
  `content` varchar(512) NOT NULL DEFAULT '' COMMENT '视图边信息',
  `update_time` bigint unsigned NOT NULL DEFAULT '0' COMMENT '更新时间(ms)',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除状态，0-正常，1-已删除',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除状态，0-正常，1-已删除',
  PRIMARY KEY (`unid`),
  UNIQUE KEY `idx_uid_id` (`uid`,`id`),
  KEY `idx_uid_update_time` (`uid`,`update_time`)
) ENGINE=InnoDB COMMENT='视图节点关系表';



# Dump of table viewnode
# ------------------------------------------------------------

DROP TABLE IF EXISTS `viewnode`;

CREATE TABLE `viewnode` (
  `unid` int unsigned NOT NULL AUTO_INCREMENT,
  `uid` int unsigned NOT NULL DEFAULT '0' COMMENT '用户id',
  `id` varchar(12) NOT NULL DEFAULT '' COMMENT 'id',
  `view_id` varchar(12) NOT NULL DEFAULT '' COMMENT '视图 id',
  `group_id` varchar(12) NOT NULL DEFAULT '' COMMENT '所属分组 id',
  `pid` varchar(12) NOT NULL DEFAULT '' COMMENT '上级 id',
  `node_type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '视图节点类型: 0-非节点，1-节点，2-视图',
  `node_id` varchar(12) NOT NULL DEFAULT '' COMMENT '节点 id',
  `vn_type_id` varchar(12) NOT NULL COMMENT '视图中节点类型 id',
  `name` varchar(64) NOT NULL DEFAULT '' COMMENT '名称',
  `content` varchar(1024) NOT NULL COMMENT '节点视图信息',
  `update_time` bigint unsigned NOT NULL DEFAULT '0' COMMENT '更新时间(ms)',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除状态，0-正常，1-已删除',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除状态，0-正常，1-已删除',
  PRIMARY KEY (`unid`),
  UNIQUE KEY `idx_uid_id` (`uid`,`id`),
  KEY `idx_uid_update_time` (`uid`,`update_time`)
) ENGINE=InnoDB COMMENT='视图节点表';




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
