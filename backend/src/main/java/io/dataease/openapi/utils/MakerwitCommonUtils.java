package io.dataease.openapi.utils;

import com.jacob.activeX.ActiveXComponent;
import com.jacob.com.Dispatch;
import com.jacob.com.Variant;

import java.io.File;

/**
 * 通用工具类
 * @author QianYe
 * @create 2022-11-01 11:37
 */
public class MakerwitCommonUtils {

    /**
     * 文字转语音并生成语音文件方法
     * @param speed 朗读速度
     * @param data 需要转的文字对象
     * @param path 语音文件保存位置对象
     * @param voiceName 文件名称
     */
    public static void textToSpeech(Integer speed,String data,String path,String voiceName) {
        if (speed == null) {
            speed = -2;
        }
        File file = new File(path);
        //如果文件夹不存在则创建
        if  (!file .exists() && !file .isDirectory()) {
            file .mkdir();
        }
        ActiveXComponent ax = null;
        try {
            ax = new ActiveXComponent("Sapi.SpVoice");
            // 运行时输出语音内容
            Dispatch spVoice = ax.getObject();
            // 下面是构建文件流把生成语音文件
            ax = new ActiveXComponent("Sapi.SpFileStream");
            Dispatch spFileStream = ax.getObject();
            ax = new ActiveXComponent("Sapi.SpAudioFormat");
            Dispatch spAudioFormat = ax.getObject();
            // 设置音频流格式
            Dispatch.put(spAudioFormat, "Type", new Variant(22));
            // 设置文件输出流格式
            Dispatch.putRef(spFileStream, "Format", spAudioFormat);
            // 调用输出 文件流打开方法，创建一个.wav文件
            Dispatch.call(spFileStream, "Open", new Variant(path+voiceName), new Variant(3), new Variant(true));
            // 设置声音对象的音频输出流为输出文件对象
            Dispatch.putRef(spVoice, "AudioOutputStream", spFileStream);
            // 设置音量 0到100
            Dispatch.put(spVoice, "Volume", new Variant(100));
            // 设置朗读速度
            Dispatch.put(spVoice, "Rate", new Variant(speed));
            // 开始朗读
            Dispatch.call(spVoice, "Speak", new Variant(data));
            // 关闭输出文件
            Dispatch.call(spFileStream, "Close");
            Dispatch.putRef(spVoice, "AudioOutputStream", null);
            spAudioFormat.safeRelease();
            spFileStream.safeRelease();
            spVoice.safeRelease();
            ax.safeRelease();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
