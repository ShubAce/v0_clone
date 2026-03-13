"use client";

import Image from "next/image";
import { signIn, signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function Home() {
	const { data: session, isPending } = useSession();

	return (
		<></>
	);
}
