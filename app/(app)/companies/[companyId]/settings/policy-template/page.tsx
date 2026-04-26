"use client";

import { TemplateBuilder } from "@/packages/policies/components/template-builder/template-builder";
import { RoleGate } from "@/packages/roles/components/role-gate";

export default function PolicyTemplatePage() {
  return (
    <RoleGate permission="policyTemplates_view">
      <TemplateBuilder />
    </RoleGate>
  );
}
