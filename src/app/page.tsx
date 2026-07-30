import { HomeView } from "@/components/home/home-view";

/**
 * Home module. Composition of Search, Continue Reading, Latest/Trending/
 * Popular/Recommended/Recently Added rails, and Categories lives in
 * HomeView (client component) since Search and Categories share filter
 * state — this file stays a server component and just renders it.
 */
export default function HomePage() {
  return <HomeView />;
}
