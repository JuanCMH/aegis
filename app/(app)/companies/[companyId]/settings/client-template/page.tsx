"use client";

import { TemplateBuilder } from "@/packages/clients/components/template-builder/template-builder";
import { RoleGate } from "@/packages/roles/components/role-gate";

export default function ClientTemplatePage() {
  return (
    <RoleGate permission="clientTemplates_view">
      <TemplateBuilder />
    </RoleGate>
  );
}
