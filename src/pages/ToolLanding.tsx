import { useParams } from 'react-router-dom';
import { TOOLS } from '../data/tools';
import { ToolTemplate } from '../components/site/ToolTemplate';
import { NotFound } from './NotFound';

export function ToolLanding() {
  const { slug } = useParams();
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) return <NotFound />;
  return <ToolTemplate key={tool.slug} tool={tool} />;
}