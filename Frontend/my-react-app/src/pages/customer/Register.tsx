import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Shirt } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input, Label } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export default function Register() {
  const { register: registerUser } = useAuth();
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
      await registerUser(values.name, values.email, values.phone, values.password);
      navigate("/orders");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed.");
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
            <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Create your account</h1>
            <p className="mt-1 text-sm text-ink/60">Book pickups and track laundry in one place.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Jane Doe" {...register("name", { required: true })} />
              {errors.name && <p className="mt-1 text-xs text-red-600">Name is required</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email", { required: true })} />
              {errors.email && <p className="mt-1 text-xs text-red-600">Email is required</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="9876543210" {...register("phone")} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                {...register("password", { required: true, minLength: 6 })}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">Min 6 characters required</p>}
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/60">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
