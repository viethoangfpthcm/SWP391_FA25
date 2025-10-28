package com.se1824.SWP391_FA25.service;

import com.se1824.SWP391_FA25.entity.Users;
import com.se1824.SWP391_FA25.repository.AuthenticationRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class TokenService {
    private final String SECRET_KEY = "l8dMflZECVdDX2MR9OoQuqxwCRqCwShi5Rw6EXGvOLZ2sEXT1lARMahRw6uj9c4S0GTpCJ72gajMWEIdGwCUgFvg4Eas86GGkiROzFTmZpyBviUDEjgXXWwU0vbPEvdbAa9bTiqtSyEO7uZ8jfA1jPoOg9plehOD61TkYGkd2rt1BfX3i1XFT4B7dh2SIFjGOi9vRbts7rcu7oygqW7z1bISwI0JG4bcTw7ZpUcC7lFv8qSyeqxtJJyDCwdMX9q4VlQ5bWA9U";

    @Autowired
    AuthenticationService authenticationService;

    @Autowired
    AuthenticationRepository authenticationRepository;

    public SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // generate ra token
    public String generateToken(Users user) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name()); // Lấy role trực tiếp
        return Jwts.builder()
                .claims(extraClaims)
                .subject(user.getUserId().toString()) // Chuyển Integer thành String
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(getSignInKey())
                .compact();
    }

    //varify token
    public Users extractToken(String token) {
        String userIdStr = extractClaim(token, Claims::getSubject);
        Integer userId = Integer.parseInt(userIdStr); // Chuyển String thành Integer
        return authenticationRepository.findById(userId).orElse(null);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser().
                verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }
}
