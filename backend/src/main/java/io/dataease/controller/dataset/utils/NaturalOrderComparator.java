package io.dataease.controller.dataset.utils;

import java.util.*;

/**
 *
 * 类名称：NaturalOrderComparator
 * 类描述：   用于带数字字母的字符串混合排序
 * 例子：↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
 * 排序前：V1FJX_6,V1FJX_12_8_3_1,V1FJX_12_8_3,V1FJX_12_8,V1FJX_12,V1FJX_12_2,V1FJX_4,V1FJX_12_4,V1FJX_2,V1FJX_12_6
 * 排序后：V1FJX_2,V1FJX_4,V1FJX_6,V1FJX_12,V1FJX_12_2,V1FJX_12_4,V1FJX_12_6,V1FJX_12_8,V1FJX_12_8_3,V1FJX_12_8_3_1
 * 例子：↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
 * 创建时间：2022年7月19日 下午5:38:38
 * @version
 */

public class NaturalOrderComparator implements Comparator {
    int compareRight(String a, String b) {
        int bias = 0, ia = 0, ib = 0;

        // The longest run of digits wins. That aside, the greatest
        // value wins, but we can't know that it will until we've scanned
        // both numbers to know that they have the same magnitude, so we
        // remember it in BIAS.
        for (; ; ia++, ib++) {
            char ca = charAt(a, ia);
            char cb = charAt(b, ib);

            if (!isDigit(ca) && !isDigit(cb)) {
                return bias;
            }
            if (!isDigit(ca)) {
                return -1;
            }
            if (!isDigit(cb)) {
                return +1;
            }
            if (ca == 0 && cb == 0) {
                return bias;
            }

            if (bias == 0) {
                if (ca < cb) {
                    bias = -1;
                } else if (ca > cb) {
                    bias = +1;
                }
            }
        }
    }

    @Override
    public int compare(Object o1, Object o2) {
        String a = o1.toString();
        String b = o2.toString();

        int ia = 0, ib = 0;
        int nza = 0, nzb = 0;
        char ca, cb;

        while (true) {
            // Only count the number of zeroes leading the last number compared
            nza = nzb = 0;

            ca = charAt(a, ia);
            cb = charAt(b, ib);

            // skip over leading spaces or zeros
            while (Character.isSpaceChar(ca) || ca == '0') {
                if (ca == '0') {
                    nza++;
                } else {
                    // Only count consecutive zeroes
                    nza = 0;
                }

                ca = charAt(a, ++ia);
            }

            while (Character.isSpaceChar(cb) || cb == '0') {
                if (cb == '0') {
                    nzb++;
                } else {
                    // Only count consecutive zeroes
                    nzb = 0;
                }

                cb = charAt(b, ++ib);
            }

            // Process run of digits
            if (Character.isDigit(ca) && Character.isDigit(cb)) {
                int bias = compareRight(a.substring(ia), b.substring(ib));
                if (bias != 0) {
                    return bias;
                }
            }

            if (ca == 0 && cb == 0) {
                // The strings compare the same. Perhaps the caller
                // will want to call strcmp to break the tie.
                return compareEqual(a, b, nza, nzb);
            }
            if (ca < cb) {
                return -1;
            }
            if (ca > cb) {
                return +1;
            }

            ++ia;
            ++ib;
        }
    }

    static boolean isDigit(char c) {
        return Character.isDigit(c) || c == '.' || c == ',';
    }

    static char charAt(String s, int i) {
        return i >= s.length() ? 0 : s.charAt(i);
    }

    static int compareEqual(String a, String b, int nza, int nzb) {
        if (nza - nzb != 0) {
            return nza - nzb;
        }

        if (a.length() == b.length()) {
            return a.compareTo(b);
        }

        return a.length() - b.length();
    }
}