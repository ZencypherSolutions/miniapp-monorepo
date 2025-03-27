"use client";

import type * as React from "react";
import { useTranslation } from "@/i18n";

// Define valid ideology values as a type for better type checking
type IdeologyValue = 'centrist' | 'moderate' | 'balanced' | 'neutral';

// Define valid axis label values
type AxisLabelValue = 'equality' | 'markets' | 'liberty' | 'authority' | 'nation' | 'globe' | 'tradition' | 'progress';

interface InsightResultCardProps {
	title: string;
	insight: string;
	description: string;
	percentage: number;
	left_label: string;
	right_label: string;
	values: {
		left: number;
		right: number;
		label: string;
	};
}

export function InsightResultCard({
	title,
	insight,
	description,
	percentage,
	left_label,
	right_label,
}: InsightResultCardProps) {
	// Calculate the progress percentage to display
	// The percentage value should reflect the right side's percentage
	const progressPercentage = percentage;
	const { t, language } = useTranslation();
	
	// Translate the ideology description if needed
	const getTranslatedDescription = (desc: string): string => {
		// Convert to lowercase for consistency in translation lookup
		const lowerDesc = desc.toLowerCase();
		
		// For specific ideology values, use translations if available
		if (['centrist', 'moderate', 'balanced', 'neutral'].includes(lowerDesc)) {
			// Use type assertion to ensure type safety
			const key = lowerDesc as IdeologyValue;
			return t(`ideology.${key}`);
		}
		
		// For other descriptions, return as is
		return desc;
	};
	
	// Translate axis labels (left_label and right_label)
	const getTranslatedAxisLabel = (label: string): string => {
		// Convert to lowercase and trim for consistent lookup
		const normalizedLabel = label.toLowerCase().trim();
		
		// Map for common axis labels
		const axisLabelMap: Record<string, AxisLabelValue | null> = {
			'equality': 'equality',
			'markets': 'markets',
			'liberty': 'liberty',
			'authority': 'authority',
			'nation': 'nation',
			'globe': 'globe',
			'tradition': 'tradition',
			'progress': 'progress',
			// Add any variations or synonyms here
			'igualdad': 'equality',
			'mercados': 'markets',
			'libertad': 'liberty',
			'autoridad': 'authority',
			'nación': 'nation',
			'global': 'globe',
			'tradición': 'tradition',
			'progreso': 'progress'
		};
		
		const mappedLabel = axisLabelMap[normalizedLabel];
		
		if (mappedLabel) {
			return t(`ideology.axis.${mappedLabel}`);
		}
		
		// If no translation is found, return the original label
		return label;
	};
	
	const translatedDescription = getTranslatedDescription(description);
	const translatedLeftLabel = getTranslatedAxisLabel(left_label);
	const translatedRightLabel = getTranslatedAxisLabel(right_label);
	
	// For debugging - can be removed in production
	if (process.env.NODE_ENV !== 'production') {
		console.log("InsightResultCard rendering with title:", title);
		console.log("InsightResultCard description:", description);
		console.log("InsightResultCard translated description:", translatedDescription);
		console.log("InsightResultCard left_label:", left_label, "→", translatedLeftLabel);
		console.log("InsightResultCard right_label:", right_label, "→", translatedRightLabel);
		console.log("InsightResultCard percentage:", percentage);
		console.log("InsightResultCard current language:", language);
	}

	return (
		<article className="rounded-3xl border border-brand-tertiary/10 bg-brand-secondary p-8 shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl">
			<h2 className="mb-4 text-2xl font-bold tracking-tight text-slate-100">
				{title}
			</h2>
			<p className="mb-8 italic leading-relaxed text-slate-200/90">
				&ldquo;{insight}&rdquo;
			</p>

			<div className="space-y-4">
				<div className="flex justify-between text-sm font-medium text-slate-200/90">
					<span className="flex items-center gap-2">
						<span
							className="h-2 w-2 rounded-full bg-accent-red"
							aria-hidden="true"
						/>
						{translatedLeftLabel}
					</span>
					<span className="flex items-center gap-2">
						{translatedRightLabel}
						<span
							className="h-2 w-2 rounded-full bg-accent-blue"
							aria-hidden="true"
						/>
					</span>
				</div>
				<div
					className="h-3 overflow-hidden rounded-full bg-neutral-bg/90 backdrop-blur-sm"
					role="progressbar"
					aria-valuenow={progressPercentage}
					aria-valuemin={0}
					aria-valuemax={100}
					tabIndex={0}
				>
					<div
						className="h-full rounded-full bg-gradient-to-r from-accent-red to-accent-redSoft transition-all duration-500"
						style={{ width: `${progressPercentage}%` }}
					/>
				</div>
				<div className="mt-6 flex justify-center">
					<div className="inline-flex rounded-full bg-emerald-400 px-4 py-1.5 text-sm font-bold text-emerald-950 shadow-md transition-shadow duration-300 hover:shadow-lg sm:text-base">
						{translatedDescription.charAt(0).toUpperCase() + translatedDescription.slice(1)}
					</div>
				</div>
			</div>
		</article>
	);
}
