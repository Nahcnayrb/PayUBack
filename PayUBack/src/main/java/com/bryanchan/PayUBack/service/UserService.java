package com.bryanchan.PayUBack.service;

import com.azure.cosmos.implementation.NotFoundException;
import com.bryanchan.PayUBack.model.User;
import com.bryanchan.PayUBack.repository.UserRepository;
import com.bryanchan.PayUBack.utils.ValueGenerator;
import com.mailjet.client.ClientOptions;
import com.mailjet.client.MailjetClient;
import com.mailjet.client.MailjetRequest;
import com.mailjet.client.MailjetResponse;
import com.mailjet.client.errors.MailjetException;
import com.mailjet.client.errors.MailjetSocketTimeoutException;
import com.mailjet.client.resource.Emailv31;
import org.jasypt.util.password.StrongPasswordEncryptor;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.bryanchan.PayUBack.utils.ValueGenerator.generateNewValue;

@Service
public class UserService {


    @Autowired
    UserRepository userRepository;

    @Value("${mailjet.mailApiKey}")
    String mailApiKey;

    @Value("${mailjet.mailApiSecret}")
    String mailApiSecret;

    @Value("${mailjet.fromEmail}")
    String fromEmail;

    public User addUser(User user, boolean isUpdate) {
        List<User> users = userRepository.findUserByUsername(user.getUsername());
        if (users.isEmpty()) {
            // every created user is guaranteed to have a token
            if (!isUpdate) {
                // case add
                String token = generateNewValue();
                user.setToken(token);
                String plainPassword = user.getPassword();
                StrongPasswordEncryptor encryptor = new StrongPasswordEncryptor();
                user.setPassword(encryptor.encryptPassword(plainPassword));
            }
            userRepository.save(user);
            return user;
        } else {
            // case already exists
            return null;
        }
    }

    public String forgotPassword(String username, String email) throws NotFoundException, MailjetSocketTimeoutException, MailjetException {

        List<User> users = userRepository.findUserByUsername(username);

        if (users.size() == 0) {
            // can't find user with given username
            // return error
            throw new NotFoundException();

        } else {
            // found user
            // check if stored email matches given email
            User u = users.get(0);
            if (!u.getEmail().equals(email)) {
                // case email did not match
                // return error
                throw new NotFoundException();
            } else {
                // case email also matched


                // store forgot email key into user
                String resetPasswordKey = ValueGenerator.generateNewValue();
                userRepository.delete(u);
                u.setResetPasswordKey(resetPasswordKey);
                userRepository.save(u);

                // can send email to given email now


                String frontEndEndpoint = "https://nahcnayrb.github.io/PayUBack/#/reset-password/";
                String url = frontEndEndpoint + resetPasswordKey;

                MailjetClient client;
                MailjetRequest request;
                client = new MailjetClient(mailApiKey, mailApiSecret, new ClientOptions("v3.1"));
                request = new MailjetRequest(Emailv31.resource)
                        .property(Emailv31.MESSAGES, new JSONArray()
                                .put(new JSONObject()
                                        .put(Emailv31.Message.FROM, new JSONObject()
                                                .put("Email", fromEmail)
                                                .put("Name", "PayUBack"))
                                        .put(Emailv31.Message.TO, new JSONArray()
                                                .put(new JSONObject()
                                                        .put("Email", email)))
                                        .put(Emailv31.Message.SUBJECT, "PayUBack - Reset Password for " + username)
                                        .put(Emailv31.Message.TEXTPART, "Hi there,")
                                        .put(Emailv31.Message.HTMLPART, "<h3>Please Click <a href='" + url + "'>here</a> to reset your password.</h3><br /> Please do NOT share this link with anyone.")
                                        .put(Emailv31.Message.CUSTOMID, "AppGettingStartedTest")));

                client.post(request);

            }
        }

        return "";

    }

    public void resetPassword(String resetPasswordKey, String password) throws NotFoundException {
        // find user using resetPasswordKey

        List<User> users = userRepository.findUserByResetPasswordKey(resetPasswordKey);

        if (users.size() == 0) {
            // case user not found
            throw new NotFoundException();
        } else {
            // found user
            User u = users.get(0);
            // delete old user
            userRepository.delete(u);

            // encrypt updated password

            StrongPasswordEncryptor encryptor = new StrongPasswordEncryptor();
            u.setPassword(encryptor.encryptPassword(password));

            // reset resetPasswordKey to null and update user
            u.setResetPasswordKey(null);
            userRepository.save(u);

        }

    }
}
