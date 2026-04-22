import type { RateHeadline } from "@/lib/types";
import { InsightCallout } from "./insight-callout";

interface RateHeadlineCardProps {
  headline: RateHeadline | null;
}

const EMPTY_STATE: { title: string; body: string } = {
  title: "Not enough variation yet",
  body: "Once you've charged a range of trial prices, we'll show whether rate moves conversion for you.",
};

export function RateHeadlineCard({ headline }: RateHeadlineCardProps) {
  if (headline === null) {
    return <InsightCallout title={EMPTY_STATE.title} body={EMPTY_STATE.body} type="info" />;
  }
  return <InsightCallout title="Rate vs trial conversion" body={headline.body} type={headline.type} />;
}
