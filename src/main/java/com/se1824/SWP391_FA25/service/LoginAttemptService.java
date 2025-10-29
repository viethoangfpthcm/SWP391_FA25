package com.se1824.SWP391_FA25.service;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class LoginAttemptService {
    private static final int MAX_ATTEMPTS = 3;
    // Cache sẽ lưu số lần đăng nhập sai của một email.
    // Các bản ghi sẽ tự động bị xóa sau 10 phút.
    private final LoadingCache<String, Integer> attemptsCache;

    public LoginAttemptService() {
        attemptsCache = Caffeine.newBuilder()
                .expireAfterWrite(3, TimeUnit.SECONDS) // Tự động mở khóa sau 10 phút
                .build(key -> 0); // Giá trị mặc định nếu key chưa tồn tại là 0
    }

    // Được gọi khi đăng nhập thất bại
    public void loginFailed(String key) {
        int attempts = attemptsCache.get(key);
        attempts++;
        attemptsCache.put(key, attempts);
    }

    // Được gọi khi đăng nhập thành công
    public void loginSucceeded(String key) {
        attemptsCache.invalidate(key); // Xóa key khỏi cache
    }

    // Kiểm tra xem tài khoản có bị khóa không
    public boolean isBlocked(String key) {
        return attemptsCache.get(key) >= MAX_ATTEMPTS;
    }

    public int getAttempts(String key) {
        return attemptsCache.get(key);
    }
}
