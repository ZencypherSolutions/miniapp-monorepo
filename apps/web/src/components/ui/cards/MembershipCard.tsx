"use client";

import { useTranslation } from "@/i18n";

interface MembershipCardProps {
  expiryDate: string;
  isActive: boolean;
  cost: number;
}

export function MembershipCard({
  expiryDate,
  isActive,
  cost,
}: MembershipCardProps) {
  const { t } = useTranslation();
  
  return (
    <div className="w-full rounded-[30px] bg-brand-secondary p-6 shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
      <div className="mb-4 flex items-start justify-between">
        <h2 className="text-3xl font-bold text-white">
          Awaken Pro
        </h2>
        <div className="rounded-[20px] bg-brand-primary px-4 py-1 shadow">
          <span className="text-base font-bold text-white">
            {isActive ? t('settings.membership.active') : t('settings.membership.inactive')}
          </span>
        </div>
      </div>

      <p className="mb-4 text-sm font-bold text-white/80">
        {t('settings.membership.nextPayment')} {expiryDate}
      </p>

      <div className="flex justify-end">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2">
          <span className="text-2xl font-bold text-neutral-black">{cost}</span>
          <svg
            className="h-6 w-6 text-neutral-black"
            viewBox="0 0 2000 2000"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M970 1999c-111-3-223-25-328-65-95-37-187-89-267-153-43-75-173-166-234-267-43-72-78-152-102-232-21-71-33-142-39-222-1-22-1-83 0-112 11-196 77-381 193-540 30-41 61-77 100-116 63-62 128-113 204-157 136-79 287-124 446-133 27-2 87-2 111 0 73 5 138 15 204 33 196 52 372 165 505 321 73 87 136 194 174 301 46 126 66 258 60 389-11 221-90 424-230 593-21 25-35 41-63 69-28 28-43 41-69 63-93 77-200 137-315 176-114 39-229 56-352 53zm64-194c147-8 284-53 406-134 43-28 88-65 123-100l12-12h-275c-172 0-282 0-295-1-95-5-183-32-263-80-121-74-210-191-248-326-4-13-10-39-11-46l0-5h-144c-79 0-144 0-144 1 0 2 3 26 5 36 38 218 163 410 347 533 115 76 244 121 380 132 14 1 29 2 33 2 19 1 56 1 74 0zm687-456c32-66 53-130 67-202 2-13 7-42 7-44 0-2-572-2-572-2h-572c0 0 2 7 5 15 14 42 35 81 64 117 9 11 38 40 49 50 24 19 46 34 72 47 43 22 84 33 138 39 2 0 168 0 368 0l365 0 10-20zm-1239-453c0 0 1-7 3-15 8-37 20-74 35-108 81-184 256-311 455-331 32-3 62-3 330-3h270l-12-12c-68-69-154-128-245-167-219-96-474-89-687 18-123 63-226 153-305 268-66 96-112 212-129 328-1 9-3 18-3 19l0 3h144c79 0 144 0 144 0zm1312-1c0-8-10-60-16-86-14-59-31-106-63-173l-4-9h-368c-315 0-368 0-368 0l-14 2c-43 6-79 17-114 34-40 19-72 42-102 72-42 42-72 90-90 146-3 8-5 14-5 14 0 0 257 1 572 1 518 0 572 0 572-2z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
