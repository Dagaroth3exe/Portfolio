import HeroV2 from "./components/v2/HeroV2";
import Thesis from "./components/sections/Thesis";
import ProjectsDrawer from "./components/v2/ProjectsDrawer";
import ExperienceLog from "./components/v2/ExperienceLog";
import SkillsPipeline from "./components/v2/SkillsPipeline";
import AboutRedacted from "./components/v2/AboutRedacted";
import Faq from "./components/sections/Faq";
import ContactTestPage, { FooterV2 } from "./components/v2/ContactTestPage";

export default function Home() {
  return (
    <main id="main">
      <HeroV2 />
      <Thesis />
      <ProjectsDrawer />
      <ExperienceLog />
      <SkillsPipeline />
      <AboutRedacted />
      <Faq />
      <ContactTestPage />
      <FooterV2 />
    </main>
  );
}
