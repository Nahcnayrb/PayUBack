package com.bryanchan.PayUBack.controller;

import com.azure.core.util.BinaryData;
import com.azure.cosmos.implementation.NotFoundException;
import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.bryanchan.PayUBack.service.ReceiptService;
import com.bryanchan.PayUBack.utils.ValueGenerator;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;

@CrossOrigin
@RestController
@RequestMapping("/receipts")
public class ReceiptController {

    @Value("${azure.blob.endpoint}")
    String blobStorageEndpoint;

    @Value("${azure.blob.connectionString}")
    String blobStorageConnectionString;

    @Value("${azure.blob.container}")
    String blobStorageContainerName;

    @Autowired
    ReceiptService receiptService;


    @PostMapping("/upsert/{receiptFileName}")
    public ResponseEntity upsert(@RequestPart MultipartFile file, @PathVariable String receiptFileName) {

        try {
            String fileName = receiptService.uploadReceipt(file, receiptFileName);
            return new ResponseEntity(fileName, HttpStatus.OK);

        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity("SERVER GOOFED", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/{receiptFileName}")
    public ResponseEntity getReceiptImage(@PathVariable String receiptFileName) {

        try {
            String contentType = receiptFileName.split("\\.")[1];

            MediaType mediaType = contentType.equals("png") ? MediaType.IMAGE_PNG : MediaType.IMAGE_JPEG;

            InputStreamResource resource = receiptService.getReceipt(receiptFileName);
            return ResponseEntity.ok().contentType(mediaType).body(resource);

        } catch (NotFoundException e) {
            return new ResponseEntity("No matching receipt found", HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity("SERVER GOOFED", HttpStatus.INTERNAL_SERVER_ERROR);
        }


    }
}
