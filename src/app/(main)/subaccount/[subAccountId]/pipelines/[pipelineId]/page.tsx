import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import {
  getLanesWithTicketAndTags,
  getPipelineDetails,
  updateLanesOrder,
  updateTicketsOrder,
} from "@/lib/queries";
import { LaneDetail } from "@/lib/types";
import { redirect } from "next/navigation";
import React from "react";
import PipelineView from "../_component/piplineView";
import PipelineInfoBar from "../_component/piplineInfoBar";
import PipelineSettings from "../_component/piplineSettings";

type Props = {
  params: { subAccountId: string; pipelineId: string };
};

const PipelinePage = async ({ params }: Props) => {
  const pipelineDetails = await getPipelineDetails(params.pipelineId);
  if (!pipelineDetails) {
    return redirect(`/subaccount/${params.subAccountId}/pipelines`);
  }

  const pipelines = await db.pipeline.findMany({
    where: { subAccountId: params.subAccountId },
  });

  const lanes = JSON.parse(
    JSON.stringify(await getLanesWithTicketAndTags(params.pipelineId)),
  );

  return (
    <Tabs defaultValue="view" className="w-full">
      <TabsList className="mb-4 h-16 w-full justify-between border-b-2 bg-transparent">
        <PipelineInfoBar
          pipelineId={params.pipelineId}
          subAccountId={params.subAccountId}
          pipelines={pipelines}
        />
        <div>
          <TabsTrigger value="view">Pipeline View</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="view">
        <PipelineView
          lanes={lanes}
          pipelineDetails={pipelineDetails}
          pipelineId={params.pipelineId}
          subaccountId={params.subAccountId}
          updateLanesOrder={updateLanesOrder}
          updateTicketsOrder={updateTicketsOrder}
        />
      </TabsContent>
      <TabsContent value="settings">
        <PipelineSettings
          pipelineId={params.pipelineId}
          pipelines={pipelines}
          subaccountId={params.subAccountId}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PipelinePage;
