"use client"
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group"
import {subjects} from "@/constants";
import {Textarea} from "@/components/ui/textarea";

import {createCompanion} from "@/lib/actions/companions.actions";
import {useRouter} from "next/navigation";

const formSchema = z.object({
    name: z.string().min(1, "Companion name is required"),
    subject: z.string().min(1, "Subject is required"),
    topic: z.string().min(1, "Topic is required"),
    voice: z.string().min(1, "Voice is required"),
    style: z.string().min(1, "Style is required"),
    duration: z.coerce.number().min(1, "Duration is required"),
})

const CompanionForm = () => {
    const router = useRouter();

        const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                name: '',
                subject: '',
                topic: '',
                voice: '',
                style: '',
                duration: 15,
            },
        })
        const onSubmit = async (values: z.infer<typeof formSchema>) => {
            try {
                const companion = await createCompanion(values);

                if(companion) {
                    router.push(`/companions/${companion.id}`)
                } else {
                    toast.error("Failed to create a companion. Please try again.");
                    router.push('/');
                }
            } catch (error: any) {
                if (error?.message?.includes('already exists')) {
                    toast.error("A companion with this name already exists. Please choose a different name.");
                } else {
                    toast.error("Failed to create companion. Please try again.");
                    console.error(error);
                }
            }
        }

    return (
        <Card className="w-full sm:max-w-md">
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FieldGroup>
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-demo-title">
                                        Companion Name
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-rhf-demo-title"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter the companion name"
                                        autoComplete="off"
                                        className="input"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="subject"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-demo-title">
                                        Subject
                                    </FieldLabel>
                                    <Select
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger
                                            id="form-rhf-select-language"
                                            aria-invalid={fieldState.invalid}
                                            className="input capitalize"
                                        >
                                            <SelectValue placeholder="Select the subject" />
                                        </SelectTrigger>
                                        <SelectContent position="item-aligned">
                                            {subjects.map((subject) => (
                                                <SelectItem
                                                    value = {subject}
                                                    key={subject}
                                                    className="capitalize"
                                                >
                                                    {subject}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="topic"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-demo-title">
                                        What should the companion help with?
                                    </FieldLabel>
                                    <Textarea
                                        {...field}
                                        id="form-rhf-demo-title"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Ex. Derivatives and Integrals"
                                        autoComplete="off"
                                        className="input"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="voice"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-demo-title">
                                        Voice
                                    </FieldLabel>
                                    <Select
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger
                                            id="form-rhf-select-language"
                                            aria-invalid={fieldState.invalid}
                                            className="input"
                                        >
                                            <SelectValue placeholder="Select the voice" />
                                        </SelectTrigger>
                                        <SelectContent position="item-aligned">
                                                <SelectItem value="male">
                                                            Male
                                                </SelectItem>
                                                <SelectItem value="female">
                                                    Female
                                                </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="style"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-demo-title">
                                        Style
                                    </FieldLabel>
                                    <Select
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger
                                            id="form-rhf-select-language"
                                            aria-invalid={fieldState.invalid}
                                            className="input"
                                        >
                                            <SelectValue placeholder="Select the style" />
                                        </SelectTrigger>
                                        <SelectContent position="item-aligned">
                                            <SelectItem value="Formal">
                                                Formal
                                            </SelectItem>
                                            <SelectItem value="Casual">
                                                Casual
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="duration"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-demo-title">
                                        Estimated session duration in minutes
                                    </FieldLabel>
                                    <Input
                                        type="number"
                                        {...field}
                                        id="form-rhf-demo-title"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="15"
                                        autoComplete="off"
                                        className="input"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                    <Button type="submit" className=" w-full cursor-pointer">
                        Build your companion
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default CompanionForm;