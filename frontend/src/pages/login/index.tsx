import React from "react";
import type { FormProps } from "antd";
import { Button, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { actLogin } from "../../redux/features/auth/authSlice";

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};



const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const navigateToHome = () => {
    navigate("/");
  };
  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
  console.log("Success:", values);
  dispatch(
    actLogin({ 
      username: values.username || "", 
      password: values.password || "", 
      cb: navigateToHome,
    })
  );
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
  console.log("Failed:", errorInfo);
};
  return (
  <Form
    name="basic"
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    style={{ maxWidth: 600 }}
    initialValues={{ remember: true }}
    onFinish={onFinish}
    onFinishFailed={onFinishFailed}
    autoComplete="off"
  >
    <Form.Item<FieldType>
      label="Username"
      name="username"
      rules={[{ required: true, message: "Please input your username!" }]}
    >
      <Input />
    </Form.Item>

    <Form.Item<FieldType>
      label="Password"
      name="password"
      rules={[{ required: true, message: "Please input your password!" }]}
    >
      <Input.Password />
    </Form.Item>

    <Form.Item label={null}>
      <Button type="primary" htmlType="submit">
        Login
      </Button>
    </Form.Item>

    <Link to="/register">Or create an account</Link>
  </Form>
  );
};

export default LoginPage;