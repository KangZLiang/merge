package io.dataease.service.db;

import cn.hutool.db.Db;
import cn.hutool.db.Entity;
import cn.hutool.db.ds.simple.SimpleDataSource;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.List;

/**
 * @author QianYe
 * @create 2022-09-08 17:38
 */
@Service
public class DBoperationService {

    @Value("${spring.datasource.url}")
    private String url;
    @Value("${spring.datasource.username}")
    private String user;
    @Value("${spring.datasource.password}")
    private String password;

    DataSource ds = null;
    DataSource getDataSource(){
        if (ds == null) {
            return ds = new SimpleDataSource(url, user, password);
        }else{
            return ds;
        }
    }

    public List select(JSONObject object) throws SQLException{
        getDataSource();

        List<Entity> tableName = Db.use(ds).findAll(Entity.create(object.getStr("tableName")));

        return tableName;
    }

    public Integer insert(JSONObject object) throws SQLException {
        getDataSource();
        JSONArray addList = object.getJSONArray("addList");

        Entity table = Entity.create(object.getStr("tableName"));
        for ( Object obj : addList ) {
            JSONObject addObj = (JSONObject) obj;
            String value = addObj.getStr("value");
            if (value != null && "".equals(value.trim())) {
                value = null;
            }
            table.set(addObj.getStr("name"), value); //添加的数据
        }

        return Db.use(ds).insert( table );
    }

    public Integer update(JSONObject object) throws SQLException {
        getDataSource();
        JSONArray updateList = object.getJSONArray("updateList");
        JSONArray whereList = object.getJSONArray("whereList");

        Entity updateEntity = Entity.create();
        Entity table = Entity.create(object.getStr("tableName"));

        for ( Object obj : updateList ) {
            JSONObject updObj = (JSONObject) obj;
            updateEntity.set(updObj.getStr("name"), updObj.get("value")); //修改的数据
        }

        for ( Object obj : whereList ) {
            JSONObject updObj = (JSONObject) obj;
            table.set(updObj.getStr("name"), updObj.get("value")); //where条件
        }
        return Db.use(ds).update(updateEntity, table);
//        Entity data = Entity.create(object.getStr("tableName")).parseBean(object.get("updateList"));
//        Entity where = Entity.create(object.getStr("tableName")).parseBean(object.get("whereList"));
//
//        return Db.use(ds).update(data, where);
//        if (dManagerService.updateData(data, where)) return "success";
//        return "error";
    }

    public Integer delete(JSONObject object) throws SQLException {
        getDataSource();
        JSONArray delList = object.getJSONArray("delList");

        Entity table = Entity.create(object.getStr("tableName"));
        for ( Object obj : delList ) {
            JSONObject delObj = (JSONObject) obj;
            table.set(delObj.getStr("name"), delObj.get("value")); //where条件
        }
        return Db.use(ds).del( table );
    }

    /**
     * 查询音频文件
     * @param content 音频内容
     * @return
     * @throws SQLException
     */
    public Entity selectFileVoice(String content) throws SQLException {
        getDataSource();
        List<Entity> like = Db.use(ds).findAll(Entity.create("sys_file_voice").set("content", content));
        if (like.size() != 0) {
            return like.get(0);
        }else{
            return null;
        }
    }
}
