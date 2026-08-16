"use client";

import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signInSchema,
  type SignInFormData,
} from "@/lib/better-auth/auth.schema";
import { authClient } from "@/lib/better-auth/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import SocialButton from "@/components/auth/social-button";
import { SITE_NAME } from "@/lib/seo";
import { normalizeCallbackUrl } from "@/lib/better-auth/callback-url";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = normalizeCallbackUrl(searchParams.get("callbackUrl"));
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });
  const onSubmit = async (data: SignInFormData) => {
    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (error) {
        const message =
          error.message || "Email hoặc mật khẩu không đúng. Vui lòng thử lại";
        setError("password", { type: "manual", message });
        toast.error(message);
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("Đăng nhập thất bại. Vui lòng thử lại", {
        description:
          error instanceof Error ? error.message : "Failed to sign in",
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
            Hãy đăng nhập để lưu danh sách theo dõi và lịch sử xem của bạn
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-4"></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
                label="Mật Khẩu"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" className="rounded border-border" />
                  Nhớ tài khoản
                </label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="mt-6 border-t border-border pt-6">
              <p className="mb-3 text-center text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <Link href="/sign-up" className="text-primary hover:underline">
                  Đăng kí
                </Link>
              </p>
              <p className="mb-4 text-center text-sm text-muted-foreground">
                Hoặc đăng nhập với
              </p>
              <SocialButton callbackUrl={callbackUrl} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SignIn;
