"use client";

import InputField from "@/components/forms/InputField";
import SocialButton from "@/components/auth/social-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authClient } from "@/lib/better-auth/auth-client";
import {
  signUpSchema,
  type SignUpFormData,
} from "@/lib/better-auth/auth.schema";
import { SITE_NAME } from "@/lib/seo";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
    },
    mode: "onBlur",
  });
  const onSubmit = async (data: SignUpFormData) => {
    try {
      const { error } = await authClient.signUp.email({
        name: data.userName,
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message || "Đăng kí thất bại. Vui lòng thử lại.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Sign-up error:", error);
      toast.error("Đăng kí thất bại. Vui lòng thử lại.", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to create an account",
      });
    }
  };
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-block">
            <span className="brand-pink-mask text-4xl font-bold">{SITE_NAME}</span>
          </Link>
          <p className="text-muted-foreground">
            Hãy đăng kí để lưu danh sách theo dõi và lịch sử xem của bạn
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-4"></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <InputField
                name="userName"
                label="Tên thí chủ"
                Icon={User}
                type="text"
                placeholder="Hãy nhập tên của bạn"
                register={register}
                error={errors.userName}
              />
              <InputField
                name="email"
                label="Email"
                Icon={Mail}
                type="text"
                placeholder="your@gmail.com"
                register={register}
                error={errors.email}
              />
              <InputField
                name="password"
                label="Mật khẩu"
                Icon={Lock}
                type={showPassword ? "text" : "password"}
                placeholder="Hãy nhập mật khẩu của bạn"
                register={register}
                error={errors.password}
              >
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </InputField>
              <div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" className="rounded border-border" />
                  Tôi đồng ý với điều khoản sử dụng
                </label>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Đang tạo tài khoản ..." : "Tạo tài khoản"}
              </Button>
            </form>

            <div className="mt-6 border-t border-border pt-6">
              <p className="mb-3 text-center text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link href="/sign-in" className="text-primary hover:underline">
                  Đăng nhập
                </Link>
              </p>
              <p className="mb-4 text-center text-sm text-muted-foreground">
                Hoặc đăng nhập với
              </p>
              <SocialButton callbackUrl="/" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SignUp;
