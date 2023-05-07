import { useState } from 'react';
import { Input, message, Modal } from 'antd';
import styles from './index.module.less';
import { handleChange } from './api';

interface IMyModal {
  openmodal: boolean;
  handleForget: () => void;
}
const MyModal = (props: IMyModal) => {
  const { openmodal, handleForget } = props;
  const [open, setOpen] = useState(openmodal);

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status1, setStatus1] = useState<'' | 'error' | 'warning' | undefined>();
  const [status2, setStatus2] = useState<'' | 'error' | 'warning' | undefined>();
  const [status3, setStatus3] = useState<'' | 'error' | 'warning' | undefined>();
  const [status4, setStatus4] = useState<'' | 'error' | 'warning' | undefined>();
  const handleUserNameChange = (e: { target: { value: string } }) => {
    setUsername(e.target.value);
  };
  const handlePasswordChange = (e: { target: { value: string } }) => {
    setPassword(e.target.value);
  };
  const handleConfirmChange = (e: { target: { value: string } }) => {
    setConfirm(e.target.value);
  };
  const handlePhoneChange = (e: { target: { value: string } }) => {
    setPhone(e.target.value);
  };
  const handleSubmit = () => {
    // 前端数据校验
    if (!username) {
      setStatus1('error');
    }
    if (!phone) {
      setStatus2('error');
    }
    if (!password) {
      setStatus3('error');
    }
    if (!confirm) {
      setStatus4('error');
    }
    if (!username || !password || !confirm) {
      message.error('请输入用户名或密码！', 1.5);
      setTimeout(() => {
        setStatus1(undefined);
        setStatus2(undefined);
        setStatus3(undefined);
        setStatus4(undefined);
      }, 1500);
      return;
    }
    if (!phone) {
      message.error('请输入手机号！', 1.5);
      setTimeout(() => {
        setStatus2(undefined);
      }, 1500);
      return;
    }
    // 验证手机号格式
    const reg = /^1[3456789]\d{9}$/;
    if (!reg.test(phone)) {
      setStatus2('error');
      message.error('手机号格式不正确！');
      setTimeout(() => {
        setStatus2(undefined);
      }, 1500);
      return;
    }
    if (password !== confirm) {
      setStatus4('error');
      message.error('两次密码不一致！');
      setTimeout(() => {
        setStatus4(undefined);
      }, 1500);
      return;
    }
    setLoading(true);
    const param = {
      username,
      password,
      confirmPassword: confirm,
      phone,
    };
    handleChange(param)
      .then((res) => {
        if (res.code === 200) {
          message.success('修改密码成功！', 1.5);
          setLoading(false);
          handleForget();
        } else {
          message.error(res.message, 1.5);
          setLoading(false);
        }
      })
      .catch(() => {
        message.error('修改密码失败，请稍后再试！', 1.5);
        setLoading(false);
      });
  };

  const handleCancel = () => {
    setOpen(false);
    handleForget();
  };

  return (
    <>
      <Modal
        title="更改密码"
        open={open}
        onOk={handleSubmit}
        confirmLoading={loading}
        onCancel={handleCancel}
        okText="确认"
        cancelText="取消"
      >
        <div className={styles.forgetContainer}>
          <Input
            type="text"
            placeholder="请输入用户名"
            name="username"
            onChange={handleUserNameChange}
            maxLength={255}
            status={status1}
          ></Input>
          <Input
            type="phone"
            placeholder="请输入绑定的手机号"
            name="phone"
            onChange={handlePhoneChange}
            maxLength={50}
            status={status2}
          ></Input>
          <Input
            type="password"
            placeholder="请输入新的密码"
            name="password"
            onChange={handlePasswordChange}
            maxLength={255}
            status={status3}
          ></Input>
          <Input
            type="password"
            placeholder="确认新的密码"
            name="password"
            onChange={handleConfirmChange}
            maxLength={255}
            status={status4}
          ></Input>
        </div>
      </Modal>
    </>
  );
};

export default MyModal;
