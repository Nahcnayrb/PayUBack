package com.bryanchan.PayUBack.service;

import com.azure.core.util.BinaryData;
import com.azure.cosmos.implementation.InternalServerErrorException;
import com.azure.cosmos.implementation.NotFoundException;
import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.bryanchan.PayUBack.utils.ValueGenerator;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
public class ReceiptService {

    @Value("${azure.blob.endpoint}")
    String blobStorageEndpoint;

    @Value("${azure.blob.connectionString}")
    String blobStorageConnectionString;

    @Value("${azure.blob.container}")
    String blobStorageContainerName;

    public String uploadReceipt(MultipartFile file, String receiptFileName) throws IOException {
            BlobServiceClient blobServiceClient =  new BlobServiceClientBuilder()
                    .endpoint(blobStorageEndpoint)
                    .connectionString(blobStorageConnectionString)
                    .buildClient();

            BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(blobStorageContainerName);
            String fileName = receiptFileName;

            BlobClient blobClient = containerClient.getBlobClient(fileName);
            blobClient.upload(file.getInputStream());

            return fileName;
    }


    public InputStreamResource getReceipt(String receiptFileName) throws NotFoundException, BadRequestException {

        BlobServiceClient blobServiceClient =  new BlobServiceClientBuilder()
                .endpoint(blobStorageEndpoint)
                .connectionString(blobStorageConnectionString)
                .buildClient();

        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(blobStorageContainerName);
        BlobClient blobClient = containerClient.getBlobClient(receiptFileName);
        if (!blobClient.exists()) {
            throw new NotFoundException();
        } else {

            try {
                BinaryData data = blobClient.downloadContent();
                InputStream in = data.toStream();

                return new InputStreamResource(in);

            } catch (Exception e) {
                e.printStackTrace();
                throw new BadRequestException();
            }
        }

    }

    public void deleteReceipt(String receiptFileName) {

        BlobServiceClient blobServiceClient =  new BlobServiceClientBuilder()
                .endpoint(blobStorageEndpoint)
                .connectionString(blobStorageConnectionString)
                .buildClient();

        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(blobStorageContainerName);
        BlobClient blobClient = containerClient.getBlobClient(receiptFileName);
        blobClient.deleteIfExists();

    }
}
