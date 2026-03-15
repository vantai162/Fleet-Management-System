export const mockUsers = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    role: "admin",
    fullName: "Nguyễn Văn An",
    email: "admin@fms.vn",
    phone: "0901234567",
  },
  {
    id: "2",
    username: "user",
    password: "user123",
    role: "staff",
    fullName: "Trần Thị Bình",
    email: "user@fms.vn",
    phone: "0902234567",
  },
  {
    id: "3",
    username: "driver",
    password: "driver123",
    role: "driver",
    fullName: "Lê Văn Cường",
    email: "driver@fms.vn",
    phone: "0903234567",
  },
];

export const loginWithMock = ({ username, password }) => {
  const user = mockUsers.find(
    (item) => item.username === username && item.password === password
  );

  if (!user) {
    return {
      ok: false,
      message: "Tên đăng nhập hoặc mật khẩu không đúng.",
    };
  }

  const { password: _password, ...safeUser } = user;
  return {
    ok: true,
    user: safeUser,
  };
};

