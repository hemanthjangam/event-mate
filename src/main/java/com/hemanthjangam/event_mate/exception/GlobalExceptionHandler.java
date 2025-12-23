package com.hemanthjangam.event_mate.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

@ControllerAdvice
@lombok.extern.slf4j.Slf4j
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ErrorDetails> handleResourceNotFoundException(ResourceNotFoundException exception,
                        WebRequest webRequest) {
                ErrorDetails errorDetails = new ErrorDetails(LocalDateTime.now(), exception.getMessage(),
                                webRequest.getDescription(false));
                return new ResponseEntity<>(errorDetails, HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ErrorDetails> handleBadRequestException(BadRequestException exception,
                        WebRequest webRequest) {
                ErrorDetails errorDetails = new ErrorDetails(LocalDateTime.now(), exception.getMessage(),
                                webRequest.getDescription(false));
                return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ErrorDetails> handleIllegalArgumentException(IllegalArgumentException exception,
                        WebRequest webRequest) {
                log.error("Illegal Argument: {}", exception.getMessage());
                ErrorDetails errorDetails = new ErrorDetails(LocalDateTime.now(), exception.getMessage(),
                                webRequest.getDescription(false));
                return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorDetails> handleGlobalException(Exception exception,
                        WebRequest webRequest) {
                log.error("Global Exception: ", exception);
                ErrorDetails errorDetails = new ErrorDetails(LocalDateTime.now(), exception.getMessage(),
                                webRequest.getDescription(false));
                return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
        }
}
