import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Vui lòng nhập đúng email"),

  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export const signUpSchema = z.object({
  userName: z
    .string()
    .min(3, "Tên người dùng phải có ít nhất 3 ký tự")
    .max(20, "Tên người dùng tối đa 20 ký tự")
    .regex(/^[a-zA-Z0-9]+$/, "Tên người dùng chỉ gồm chữ và số"),

  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Vui lòng nhập đúng email"),

  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(100)
    .regex(/[A-Z]/, "Mật khẩu phải có ít nhất một chữ in hoa")
    .regex(/[a-z]/, "Mật khẩu phải có ít nhất một chữ thường")
    .regex(/[0-9]/, "Mật khẩu phải có ít nhất một chữ số"),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
