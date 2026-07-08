"use client";

import type { ComponentProps, FormEvent } from "react";

type ValidatedFormProps = Omit<ComponentProps<"form">, "onSubmitCapture" | "onChangeCapture"> & {
  requiredGroups?: string[];
};

export function evaluateRequiredGroup(form: HTMLFormElement, groupName: string) {
  const group = form.querySelector<HTMLElement>(`[data-required-group="${groupName}"]`);

  if (!group) {
    return true;
  }

  const checkedItems = form.querySelectorAll(`input[name="${groupName}"]:checked`);
  const isValid = checkedItems.length > 0;

  if (isValid) {
    group.removeAttribute("data-group-invalid");
  } else {
    group.setAttribute("data-group-invalid", "true");
  }

  return isValid;
}

export function validateFormBeforeSubmit(form: HTMLFormElement, requiredGroups: string[]) {
  form.setAttribute("data-submitted", "true");

  const groupValidity = requiredGroups.map((groupName) => ({
    groupName,
    isValid: evaluateRequiredGroup(form, groupName),
  }));

  const firstInvalidGroup = groupValidity.find((group) => !group.isValid);
  const nativeValid = form.checkValidity();

  if (nativeValid && !firstInvalidGroup) {
    return true;
  }

  if (!nativeValid) {
    form.reportValidity();
    const firstInvalidField = form.querySelector<HTMLElement>(
      "input:invalid, textarea:invalid, select:invalid",
    );
    firstInvalidField?.scrollIntoView({ behavior: "smooth", block: "center" });
    firstInvalidField?.focus();
    return false;
  }

  if (firstInvalidGroup) {
    const invalidGroup = form.querySelector<HTMLElement>(
      `[data-required-group="${firstInvalidGroup.groupName}"]`,
    );
    invalidGroup?.scrollIntoView({ behavior: "smooth", block: "center" });
    invalidGroup
      ?.querySelector<HTMLInputElement>(`input[name="${firstInvalidGroup.groupName}"]`)
      ?.focus();
  }

  return false;
}

export function ValidatedForm({
  requiredGroups = [],
  children,
  ...props
}: ValidatedFormProps) {
  function handleSubmitCapture(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    if (!validateFormBeforeSubmit(form, requiredGroups)) {
      event.preventDefault();
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
    <form {...props} onSubmitCapture={handleSubmitCapture} onChangeCapture={handleChangeCapture}>
      {children}
    </form>
  );
}
