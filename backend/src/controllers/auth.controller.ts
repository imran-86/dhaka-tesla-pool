// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dhaka-tesla-secret-key-2026';

// Zod Validation Schemas
export const loginSchema = z.object({
  phone: z.string().min(10, { message: 'সঠিক মোবাইল নম্বর দিন' }),
  password: z.string().min(6, { message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' }),
});

export const registerSchema = z.object({
  phone: z.string().min(10, { message: 'সঠিক মোবাইল নম্বর দিন' }),
  password: z.string().min(6, { message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' }),
  name: z.string().min(2, { message: 'নাম আবশ্যক' }),
  role: z.enum(['PASSENGER', 'DRIVER']).default('PASSENGER'),
});

export class AuthController {
  /**
   * Phone + Password Login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { phone, password } = req.body;

      // 1. Find user by phone
      const user = await prisma.user.findUnique({
        where: { phone },
        include: { vehicle: true },
      });

      if (!user) {
        res.status(401).json({
          status: 'fail',
          message: 'ভুল ফোন নম্বর অথবা পাসওয়ার্ড',
        });
        return;
      }

      // 2. Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          status: 'fail',
          message: 'ভুল ফোন নম্বর অথবা পাসওয়ার্ড',
        });
        return;
      }

      // 3. Issue signed JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.cookie('tesla_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        status: 'success',
        message: 'লগইন সফল হয়েছে',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            vehicle: user.vehicle,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  /**
   * Register new Passenger or Driver
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { phone, password, name, role } = req.body;

      // Check if phone already exists
      const existingUser = await prisma.user.findUnique({ where: { phone } });
      if (existingUser) {
        res.status(409).json({
          status: 'fail',
          message: 'এই ফোন নম্বর দিয়ে ইতোমধ্যে অ্যাকাউন্ট তৈরি করা হয়েছে',
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          phone,
          name,
          password: hashedPassword,
          role: role as Role,
          ...(role === 'DRIVER'
            ? {
                vehicle: {
                  create: {
                    modelName: 'Bullet',
                    capacity: 3,
                    isOnline: true,
                  },
                },
              }
            : {}),
        },
        include: { vehicle: true },
      });

      // Issue Token
      const token = jwt.sign(
        {
          userId: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        status: 'success',
        message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            vehicle: user.vehicle,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  /**
   * Profile endpoint
   */
  static async getMe(req: any, res: Response): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
          vehicle: true,
        },
      });

      if (!user) {
        res.status(404).json({ status: 'fail', message: 'ব্যবহারকারী পাওয়া যায়নি' });
        return;
      }

      res.status(200).json({ status: 'success', data: user });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}