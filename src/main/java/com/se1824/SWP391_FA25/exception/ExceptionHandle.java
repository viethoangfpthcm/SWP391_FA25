package com.se1824.SWP391_FA25.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionHandle {
    //Canh bắt lỗi cho mình
    //MethodArgumentNotValidException => lỗi do thư vện quăng ra

    //nếu gặp lỗi MethodArgumentNotValidException  => hàm này sẽ được chạy
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException exception) {
        String message = "";
        for (FieldError fe : exception.getBindingResult().getFieldErrors()) {
            message += fe.getDefaultMessage() + "\n";
        }
        return new ResponseEntity<>(message, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentialsException(BadCredentialsException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("username or password invalid");
    }

    @ExceptionHandler(InternalAuthenticationServiceException.class)
    public ResponseEntity<?> handleInternalAuthenticationServiceException(InternalAuthenticationServiceException exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Email may not be registered");
    }

//    @ExceptionHandler(AuthenticationException.class)
//    public ResponseEntity<?> hanleAuthenticationException(AuthenticationException exception){
//        return ResponseEntity.status(401).body(exception.getMessage());
//    }
}
