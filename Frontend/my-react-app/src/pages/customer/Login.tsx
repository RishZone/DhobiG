import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Shirt } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input, Label } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";

interface FormValues {
  email: string;
  password: string;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setError("");
    try {
      const user = await login(values.email, values.password);
      navigate(user.role === "admin" ? "/admin" : "/orders");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Login failed. Check your credentials.");
    }
  }

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
              <Shirt size={22} />
            </span>
            <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Welcome back</h1>
            <p className="mt-1 text-sm text-ink/60">Log in to manage your laundry orders.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email", { required: true })} />
              {errors.email && <p className="mt-1 text-xs text-red-600">Email is required</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password", { required: true })} />
              {errors.password && <p className="mt-1 text-xs text-red-600">Password is required</p>}
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-5 rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-700">
            Demo: <span className="font-mono">demo@dhobig.com</span> / <span className="font-mono">Demo@123</span>
            <br />
            Admin: <span className="font-mono">admin@dhobig.com</span> / <span className="font-mono">Admin@123</span>
          </div>

          <p className="mt-6 text-center text-sm text-ink/60">
            No account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
