"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps, FormEvent } from "react";
import { useState } from "react";

import { validateFormBeforeSubmit, evaluateRequiredGroup } from "@/components/validated-form";

type AsyncRedirectFormProps = Omit<ComponentProps<"form">, "onSubmit" | "onChangeCapture"> & {
  requiredGroups?: string[];
};

export function AsyncRedirectForm({
  requiredGroups = [],
  children,
  ...props
}: AsyncRedirectFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!validateFormBeforeSubmit(form, requiredGroups)) {
      return;
    }

    try {
      setPending(true);
      const body = new FormData(form);
      const submitter = (event.nativeEvent as SubmitEvent).submitter;

      if (
        (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) &&
        submitter.name
      ) {
        body.set(submitter.name, submitter.value);
      }

      const response = await fetch(form.action || window.location.href, {
        method: (form.method || "post").toUpperCase(),
        body,
        credentials: "same-origin",
      });

      const targetUrl = response.url ? new URL(response.url) : new URL(window.location.href);
      router.replace(`${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`);
      router.refresh();
    } catch {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("error", "request-failed");
      router.replace(`${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  function handleChangeCapture(event: FormEvent<HTMLFormElement>) {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (requiredGroups.includes(target.name)) {
      evaluateRequiredGroup(event.currentTarget, target.name);
    }
  }

  return (
    <form {...props} onSubmit={handleSubmit} onChangeCapture={handleChangeCapture} data-pending={pending ? "true" : undefined}>
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
