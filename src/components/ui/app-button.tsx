import { VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "./button";
import { cn } from "@/lib/utils";

const AppButton = ({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) => {
  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      asChild={asChild}
      className={cn(className, "cursor-pointer rounded-sm")}
    />
  );
};

export default AppButton;
