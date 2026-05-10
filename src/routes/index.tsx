import { createFileRoute } from "@tanstack/react-router";

import { IntroPageDeleteMe } from "#/components/_DELETE_ME_intro_page";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  /**
   * This is the intro component for TanStarter,
   * which you may delete after creating the project,
   * and replace it with your own homepage or landing page.
   *
   * Have fun!
   */
  return <IntroPageDeleteMe />;
}
