"use server";
import { RegisterSchema } from "@/schemas";
import * as z from "zod";
import bcrypt from "bcrypt";
import {db} from "@/lib/db";
import {getUserByEmail} from "@/data/user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if(!validatedFields.success){
        return {error: "Invalid fields!"}
    }

    const {name, email, password} = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existUser = await getUserByEmail(email);

    if (existUser) return {error: "Email already taken!"}

    await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    });

    // TODO send verification token in email


    return {success: "User created!"}
}