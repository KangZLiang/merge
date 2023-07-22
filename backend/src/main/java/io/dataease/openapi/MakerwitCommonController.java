package io.dataease.openapi;

import cn.hutool.core.io.FileUtil;
import cn.hutool.db.Entity;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import io.dataease.openapi.utils.MakerwitCommonUtils;
import io.dataease.service.db.DBoperationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * @author QianYe
 * @create 2022-11-01 11:35
 */
@Controller
@CrossOrigin
@RequestMapping("openapi")
public class MakerwitCommonController {
    @Value("${upload.voicefile.path}")
    private String path;
    @Resource
    private DBoperationService dbService;

    /**
     * 获取音频信息
     * @param jsonStr
     * @return
     */
    @PostMapping(value = "/generatevoice")
    @ResponseBody
    public JSONArray generatevoice(@RequestBody String jsonStr) {
        JSONObject parse = JSONUtil.parseObj(jsonStr);
        JSONArray contents = parse.getJSONArray("contents");
        Integer speed = parse.getInt("speed");
        if (contents.size() == 0) {
            throw new RuntimeException("内容不能为空");
        }
        if (speed == null) {
            throw new RuntimeException("朗读速度不能为空");
        }
        if (speed == null) {
            throw new RuntimeException("朗读速度不能为空");
        }
        //-10 到 +10
        if (speed < -10 ||speed > 10) {
            throw new RuntimeException("朗读速度范围：-10 到 +10");
        }

        Entity entity = null;
        JSONArray reArray = new JSONArray();
        for ( Object obj : contents ) {
            String content = (String) obj;
            Map<String, Object> map = new HashMap<>();
            try {
                //查询音频表是否已经存在当前文件
                entity = dbService.selectFileVoice(content.trim());
                if (entity != null) {
                    map.put("content",content);
                    map.put("voiceName",entity.getStr("file_url"));
                    reArray.add(map);
                }else{
                    String voiceName = UUID.randomUUID().toString() +".wav";
                    String dirPath = System.getProperty("user.dir").substring(0, 2)+path;
                    MakerwitCommonUtils.textToSpeech(speed,content,dirPath,voiceName);
                    map.put("content",content);
                    map.put("voiceName","/static-resource/voice/"+voiceName);
                    reArray.add(map);
                    JSONObject jsonObject = new JSONObject();
                    jsonObject.set("tableName","sys_file_voice");
                    JSONArray jsonArray = new JSONArray();
                    JSONObject setObject = new JSONObject();
                    setObject.set("name","content");
                    setObject.set("value",content.trim());
                    jsonArray.add(setObject);
                    setObject = new JSONObject();
                    setObject.set("name","file_url");
                    setObject.set("value",map.get("voiceName"));
                    jsonArray.add(setObject);
                    jsonObject.set("addList",jsonArray);
                    dbService.insert(jsonObject);
                }
            } catch (SQLException throwables) {
                throw new RuntimeException(throwables.getMessage());
            }
        }

        return reArray;
    }
}
