import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-6">
            <div className="card-neumorphic p-4">
                <SignIn />
            </div>
        </div>
    );
}
