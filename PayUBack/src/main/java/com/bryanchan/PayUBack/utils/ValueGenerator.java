package com.bryanchan.PayUBack.utils;

import java.security.SecureRandom;
import java.util.Base64;

public class ValueGenerator {


    private static final SecureRandom secureRandom = new SecureRandom(); //threadsafe
    private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder(); //threadsafe

    public static String generateNewValue() {
        byte[] randomBytes = new byte[24];
        secureRandom.nextBytes(randomBytes);
        return base64Encoder.encodeToString(randomBytes);
    }
}
