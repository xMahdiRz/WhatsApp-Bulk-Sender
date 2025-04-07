import { useTranslations } from "next-intl";

import ThemeChanger from "@/components/theme-changer";
import LanguageChanger from "@/components/language-changer";

export default function HomePage() {
  const t = useTranslations("HomePage");
  return (
    <div>
      <h1>{t("title")}</h1>
      <ThemeChanger />
      <LanguageChanger />
    </div>
  );
}
