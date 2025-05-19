import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  jwt: {
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            superAdmin: true,
            college: true,
            hod: { include: { college: true, department: true } },
            faculty: { include: { college: true, department: true } },
            student: { include: { college: true, department: true } },
          },
        });

        if (!user) {
          throw new Error("No user found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Check college status if the user is a COLLEGE
        if (user.role === "COLLEGE") {
          if (!user.college) {
            throw new Error("College details not found for this account.");
          }
          if (user.college.status === "PENDING") {
            throw new Error("Please wait for admin approval.");
          }
          if (user.college.status === "REJECTED") {
            throw new Error("Your account has been rejected by admin.");
          }
        }

        // Map fields based on user role and relations
        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
          collegeType:
            user.college?.collegeType ||
            user.hod?.college?.collegeType ||
            user.faculty?.college?.collegeType ||
            user.student?.college?.collegeType ||
            null,
          departmentType:
            user.college?.departmentType ||
            user.hod?.department?.departmentType ||
            user.faculty?.department?.departmentType ||
            user.student?.department?.departmentType ||
            null,
          collegeId:
            user.college?.id ||
            user.hod?.collegeId ||
            user.faculty?.collegeId ||
            user.student?.collegeId ||
            null,
          departmentId:
            user.hod?.departmentId ||
            user.faculty?.departmentId ||
            user.student?.departmentId ||
            null,
          // Only include passwordChanged for students
          passwordChanged: user.role === "STUDENT" ? user.passwordChanged : undefined,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.collegeType = token.collegeType;
        session.user.departmentType = token.departmentType;
        session.user.collegeId = token.collegeId;
        session.user.departmentId = token.departmentId;
        // Pass passwordChanged to session for students
        if (token.role === "STUDENT") {
          session.user.passwordChanged = token.passwordChanged;
        }
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.collegeType = user.collegeType;
        token.departmentType = user.departmentType;
        token.collegeId = user.collegeId;
        token.departmentId = user.departmentId;
        // Pass passwordChanged to token for students
        if (user.role === "STUDENT") {
          token.passwordChanged = user.passwordChanged;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};

export default authOptions;