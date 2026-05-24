package com.mindskip.xzs.viewmodel.student.user;

import javax.validation.constraints.NotBlank;

public class UserUpdatePwdVM {

    @NotBlank
    private String password;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
