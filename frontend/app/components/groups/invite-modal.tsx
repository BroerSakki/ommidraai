"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/app/components/ui/modal";

type InviteRole = "admin" | "member" | "guest";

type InviteModalProps = {
  isOpen: boolean;
  groupId: string;
  roles: InviteRole[];
  onClose: () => void;
};

export function InviteModal({ isOpen, groupId, roles, onClose }: InviteModalProps) {
  const t = useTranslations("group");
  const tCommon = useTranslations("common");
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState<InviteRole>(roles[0] ?? "member");
  const [codeRole, setCodeRole] = useState<InviteRole>(roles[0] ?? "member");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setUsername("");
      setInviteCode(null);
      setError("");
      setUserRole(roles[0] ?? "member");
      setCodeRole(roles[0] ?? "member");
    }
  }, [isOpen, roles]);

  async function readResponse(response: Response) {
    const data = (await response.json().catch(() => null)) as
      | { detail?: string; code?: number }
      | null;
    if (!response.ok) {
      throw new Error(data?.detail || tCommon("somethingWentWrong"));
    }
    return data;
  }

  async function inviteUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(
        `/api/backend/invite/${groupId}?username=${encodeURIComponent(trimmedUsername)}&role=${userRole}`,
        { method: "POST" }
      );
      await readResponse(response);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  async function generateCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(
        `/api/backend/invite/code/generate?group_id=${groupId}&role=${codeRole}`,
        { method: "POST" }
      );
      const data = await readResponse(response);
      if (data?.code === undefined) throw new Error(t("inviteCodeMissing"));
      setInviteCode(String(data.code));
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("inviteTitle")}
      description={t("inviteDescription")}
      closeLabel={tCommon("closeModal")}
    >
      <div className="space-y-6">
        <section className="border-b border-gray-200 pb-6">
          <h3 className="mb-1 text-lg font-bold text-gray-900">{t("inviteUserTitle")}</h3>
          <p className="mb-4 text-sm text-gray-500">{t("inviteUserDescription")}</p>
          <form onSubmit={inviteUser} className="space-y-4">
            <div>
              <label htmlFor="invite-username" className="mb-2 block text-sm font-semibold text-[#3d3461]">{t("username")}</label>
              <input
                id="invite-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder={t("usernamePlaceholder")}
                required
                disabled={submitting}
                className="w-full rounded-xl border-2 border-[#b6cfc6] px-4 py-3 text-gray-700 outline-none focus:border-[#3d3461] disabled:opacity-60"
              />
            </div>
            <RoleSelect id="invite-user-role" value={userRole} roles={roles} onChange={setUserRole} label={t("inviteRole")} />
            <button type="submit" disabled={submitting} className="rounded-xl bg-[#3d3461] px-5 py-3 font-semibold text-white transition hover:bg-[#544a85] disabled:opacity-60">
              {t("sendInvite")}
            </button>
          </form>
        </section>

        <section>
          <h3 className="mb-1 text-lg font-bold text-gray-900">{t("generateInviteCodeTitle")}</h3>
          <p className="mb-4 text-sm text-gray-500">{t("generateInviteCodeDescription")}</p>
          <form onSubmit={generateCode} className="space-y-4">
            <RoleSelect id="invite-code-role" value={codeRole} roles={roles} onChange={setCodeRole} label={t("inviteRole")} />
            <button type="submit" disabled={submitting} className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-60">
              {t("generateInviteCode")}
            </button>
          </form>
          {inviteCode && <p className="mt-4 rounded-xl bg-green-50 p-4 text-center text-2xl font-bold tracking-widest text-green-800" aria-live="polite">{inviteCode}</p>}
        </section>

        {error && <p className="text-sm font-semibold text-red-600" role="alert">{error}</p>}
        <div className="flex justify-end">
          <button type="button" onClick={onClose} disabled={submitting} className="rounded-xl border-2 border-[#b6cfc6] px-5 py-3 font-semibold text-[#3d3461] hover:bg-[#eef5f1] disabled:opacity-60">
            {tCommon("cancel")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function RoleSelect({ id, label, value, roles, onChange }: { id: string; label: string; value: InviteRole; roles: InviteRole[]; onChange: (role: InviteRole) => void }) {
  const t = useTranslations("group");
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[#3d3461]">{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value as InviteRole)} className="w-full rounded-xl border-2 border-[#b6cfc6] bg-white px-4 py-3 text-gray-700 outline-none focus:border-[#3d3461]">
        {roles.map((role) => <option key={role} value={role}>{t(`role_${role}`)}</option>)}
      </select>
    </div>
  );
}