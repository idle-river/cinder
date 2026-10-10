"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ImagePlus,
  Sparkles,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Area } from "react-easy-crop";
import Cropper from "react-easy-crop";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

type FormState = {
  name: string;
  email: string;
  password: string;
  username: string;
  displayUsername: string;
  imageUrl: string;
};

const TOTAL_STEPS = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

async function fakeUploadToS3(domain: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(domain || "domain")}&background=random`;
}

async function loadImage(source: string) {
  const image = new window.Image();
  image.src = source;
  await image.decode();
  return image;
}

async function createCroppedBlob(source: string, cropArea: Area) {
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not initialize canvas context.");

  context.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((fileBlob) => {
      if (!fileBlob) {
        reject(new Error("Failed to create cropped image."));
        return;
      }
      resolve(fileBlob);
    }, "image/png");
  });
}

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImageSource, setSelectedImageSource] = useState<string | null>(
    null,
  );
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [errors, setErrors] = useState<{ [K in keyof FormState]?: string }>({});
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    username: "",
    displayUsername: "",
    imageUrl: "",
  });

  const progress = useMemo(() => (step / TOTAL_STEPS) * 100, [step]);

  useEffect(() => {
    return () => {
      if (selectedImageSource?.startsWith("blob:")) {
        URL.revokeObjectURL(selectedImageSource);
      }
      if (croppedPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(croppedPreview);
      }
    };
  }, [selectedImageSource, croppedPreview]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  function validateCurrentStep() {
    const nextErrors: { [K in keyof FormState]?: string } = {};

    if (step === 1) {
      if (!form.name.trim()) nextErrors.name = "Name is required.";
      if (!form.email.trim()) {
        nextErrors.email = "Email is required.";
      } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
        nextErrors.email = "Please enter a valid email.";
      }
      if (!form.password.trim()) {
        nextErrors.password = "Password is required.";
      } else if (form.password.length < 8) {
        nextErrors.password = "Password must be at least 8 characters.";
      }
    }

    if (step === 2) {
      if (!form.username.trim()) {
        nextErrors.username = "Username is required.";
      } else if (!/^[a-z0-9_]+$/i.test(form.username)) {
        nextErrors.username = "Use letters, numbers, and underscores only.";
      }

      if (!form.displayUsername.trim()) {
        nextErrors.displayUsername = "Display username is required.";
      }
    }

    if (step === 3 && !form.imageUrl) {
      nextErrors.imageUrl = "Please upload and crop an image.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNextStep() {
    if (!validateCurrentStep()) return;
    setStep((current) => clamp(current + 1, 1, TOTAL_STEPS));
  }

  function handlePreviousStep() {
    setStep((current) => clamp(current - 1, 1, TOTAL_STEPS));
  }

  function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (selectedImageSource?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedImageSource);
    }

    const blobUrl = URL.createObjectURL(file);
    setSelectedImageSource(blobUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropDialogOpen(true);
    setErrors((previous) => ({ ...previous, imageUrl: undefined }));
  }

  async function handleCropAndUpload() {
    if (!selectedImageSource || !croppedAreaPixels) return;

    setIsUploading(true);

    try {
      const blob = await createCroppedBlob(
        selectedImageSource,
        croppedAreaPixels,
      );

      if (croppedPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(croppedPreview);
      }
      const localPreview = URL.createObjectURL(blob);
      setCroppedPreview(localPreview);

      const domain =
        form.username || form.displayUsername || form.name || "domain";
      const uploadedUrl = await fakeUploadToS3(domain);
      updateField("imageUrl", uploadedUrl);

      setCropDialogOpen(false);
    } catch {
      setErrors((previous) => ({
        ...previous,
        imageUrl: "Could not crop and upload image. Try another file.",
      }));
    } finally {
      setIsUploading(false);
    }
  }

  function handleClearImage() {
    if (croppedPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(croppedPreview);
    }
    setCroppedPreview(null);
    updateField("imageUrl", "");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitting(false);

    setStep(1);
    setForm({
      name: "",
      email: "",
      password: "",
      username: "",
      displayUsername: "",
      imageUrl: "",
    });

    if (selectedImageSource?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedImageSource);
    }
    if (croppedPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(croppedPreview);
    }

    setSelectedImageSource(null);
    setCroppedPreview(null);
    setCroppedAreaPixels(null);
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-orange-50 via-amber-50/30 to-background px-4 py-10 dark:from-orange-950/20 dark:via-amber-950/10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto w-full max-w-lg"
      >
        <Card className="border-orange-200/70 shadow-xl shadow-orange-100/50 dark:border-orange-900/40 dark:shadow-none">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Sparkles className="size-4" />
              <span className="text-sm font-semibold">Cinder</span>
            </div>
            <CardTitle className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-2xl font-bold text-transparent dark:from-orange-300 dark:to-amber-200">
              Create your account
            </CardTitle>
            <CardDescription>
              Step {step} of {TOTAL_STEPS}
            </CardDescription>
            <Progress
              value={progress}
              className="h-2 bg-orange-100 dark:bg-orange-950/40"
            />
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {step === 1 ? (
                    <>
                      <Field
                        label="Name"
                        value={form.name}
                        onChange={(value) => updateField("name", value)}
                        error={errors.name}
                        autoComplete="name"
                        placeholder="Ada Lovelace"
                      />
                      <Field
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(value) => updateField("email", value)}
                        error={errors.email}
                        autoComplete="email"
                        placeholder="you@cinder.com"
                      />
                      <Field
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={(value) => updateField("password", value)}
                        error={errors.password}
                        autoComplete="new-password"
                        placeholder="Minimum 8 characters"
                      />
                    </>
                  ) : null}

                  {step === 2 ? (
                    <>
                      <Field
                        label="Username"
                        value={form.username}
                        onChange={(value) => updateField("username", value)}
                        error={errors.username}
                        autoComplete="username"
                        placeholder="cinder_user"
                      />
                      <Field
                        label="Display Username"
                        value={form.displayUsername}
                        onChange={(value) =>
                          updateField("displayUsername", value)
                        }
                        error={errors.displayUsername}
                        placeholder="Cinder User"
                      />
                    </>
                  ) : null}

                  {step === 3 ? (
                    <div className="space-y-4">
                      <Label>Profile image</Label>

                      {croppedPreview ? (
                        <div className="relative h-44 rounded-xl border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-900 dark:bg-orange-950/10">
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon-sm"
                            className="absolute top-2 right-2 bg-white/90 text-orange-700 hover:bg-white"
                            onClick={handleClearImage}
                          >
                            <X className="size-4" />
                            <span className="sr-only">Remove image</span>
                          </Button>

                          <div className="flex h-full items-center gap-4 pr-10">
                            <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-orange-200 bg-white shadow-sm dark:border-orange-900 dark:bg-orange-950/40">
                              <NextImage
                                src={croppedPreview}
                                alt="Cropped profile preview"
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>

                            <div className="space-y-1">
                              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                Image ready
                              </p>
                              <p className="line-clamp-2 text-xs text-muted-foreground">
                                {form.imageUrl}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <label
                            htmlFor="profile-image"
                            className="flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-orange-300 bg-orange-50/60 text-center transition hover:bg-orange-100/70 dark:border-orange-900 dark:bg-orange-950/20 dark:hover:bg-orange-950/30"
                          >
                            <UploadCloud className="size-5 text-orange-600 dark:text-orange-300" />
                            <span className="text-sm font-medium">
                              Upload and crop image
                            </span>
                            <span className="text-xs text-muted-foreground">
                              PNG / JPG supported
                            </span>
                          </label>

                          <Input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageSelection}
                          />
                        </>
                      )}

                      {errors.imageUrl ? (
                        <p className="text-sm text-destructive">
                          {errors.imageUrl}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {step === 4 ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-4 dark:border-orange-900 dark:bg-orange-950/15">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-orange-700 dark:text-orange-300">
                          <CheckCircle2 className="size-4" />
                          Confirm your details
                        </h3>
                        <dl className="space-y-2 text-sm">
                          <SummaryRow label="Name" value={form.name} />
                          <SummaryRow label="Email" value={form.email} />
                          <SummaryRow label="Username" value={form.username} />
                          <SummaryRow
                            label="Display Username"
                            value={form.displayUsername}
                          />
                          <SummaryRow label="Image URL" value={form.imageUrl} />
                        </dl>

                        <Button
                          type="submit"
                          className="mt-4 w-full"
                          disabled={isUploading || isSubmitting}
                        >
                          {isSubmitting ? "Creating account" : "Ready?"}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={step === 1 || isUploading || isSubmitting}
                >
                  Back
                </Button>

                {step < TOTAL_STEPS ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isUploading || isSubmitting}
                  >
                    Continue
                  </Button>
                ) : null}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  className="font-medium text-orange-700 hover:underline dark:text-orange-300"
                  href="/login"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Crop profile image</DialogTitle>
            <DialogDescription>
              Position your image and save. This demo uses a fake placeholder S3
              upload response.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative mx-auto h-80 w-full overflow-hidden rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
              {selectedImageSource ? (
                <Cropper
                  image={selectedImageSource}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(
                    _croppedArea: Area,
                    croppedAreaPixels: Area,
                  ) => setCroppedAreaPixels(croppedAreaPixels)}
                  cropShape="round"
                  showGrid={false}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <UserRound className="size-10 text-muted-foreground" />
                </div>
              )}
            </div>

            <RangeControl
              label="Zoom"
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              onChange={(value) => setZoom(value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCropDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCropAndUpload}
              disabled={isUploading || !selectedImageSource}
            >
              <ImagePlus className="size-4" />
              {isUploading ? "Uploading..." : "Save crop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  value,
  error,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={
          error
            ? "border-destructive focus-visible:ring-destructive/20"
            : undefined
        }
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value || "—"}</dd>
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <Label>{label}</Label>
        <span className="text-muted-foreground">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-orange-600 dark:accent-orange-300"
      />
    </div>
  );
}
