import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// You'll need to import your TopicInSubjectService
import TopicInSubjectService from "@/services/Admin_Service/Topic_InSubject_service";

// Define the Topic interface (adjust properties based on your actual Topic type)
export interface Topic {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  price: number;
  regularPrice: number;
  subscriptionPeriod?: string;
  order?: number;
  showTopic?: boolean;
}

interface EditTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: Topic | null;
  onTopicUpdated: () => void;
}

const EditTopicDialog: React.FC<EditTopicDialogProps> = ({
  open,
  onOpenChange,
  topic,
  onTopicUpdated,
}) => {
  const [topicData, setTopicData] = useState<{
    title: string;
    description: string;
    price: number;
    regularPrice: number;
    subscriptionPeriod: string;
    order: number;
  }>({
    title: "",
    description: "",
    price: 0,
    regularPrice: 0,
    subscriptionPeriod: "monthly",
    order: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  // Initialize form with topic data when the dialog opens
  useEffect(() => {
    if (topic) {
      setTopicData({
        title: topic.title || topic.name || "",
        description: topic.description || "",
        price: topic.price || 0,
        regularPrice: topic.regularPrice || 0,
        subscriptionPeriod: topic.subscriptionPeriod || "monthly",
        order: topic.order || 0,
      });
    }
  }, [topic]);

  if (!topic) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setTopicData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setTopicData((prev) => ({
      ...prev,
      [id]: value === "" ? 0 : Number(value),
    }));
  };

  const handleSubscriptionPeriodChange = (value: string) => {
    setTopicData((prev) => ({ ...prev, subscriptionPeriod: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!topicData.title) {
        throw new Error("Topic title is required");
      }

      const topicId = topic._id || topic.id;
      if (!topicId) throw new Error("Topic ID is missing");

      // Format data for API
      const apiTopicData = {
        title: topicData.title.trim(),
        description: topicData.description || "",
        showTopic: true,
        price: topicData.price,
        regularPrice: topicData.regularPrice,
        subscriptionPeriod: topicData.subscriptionPeriod,
        order: parseInt(topicData.order.toString()) || 0,
      };

      console.log("Sending topic update data to API:", apiTopicData);

      // You'll need to import and use your actual service
      const result = await TopicInSubjectService.updateTopic(
        topicId,
        apiTopicData
      );
      console.log("API update response:", result);

      toast({
        title: "Topic updated",
        description: "The topic has been updated successfully.",
        duration: 1000, // show for 1 second
      });


      onOpenChange(false);
      onTopicUpdated();
    } catch (error: any) {
      console.error("Failed to update topic:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update topic. Please try again.";

toast({
  variant: "destructive",
  title: "Error",
  description: errorMessage,
  duration: 1000, // show for 1 second
});

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] mx-4 max-w-full p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-amber-700 p-6 text-white">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Edit Topic
          </DialogTitle>
          <div className="flex items-center mt-2 text-amber-100">
            <span className="text-sm">Update topic information</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Topic Title
              </Label>
              <Input
                id="title"
                value={topicData.title}
                onChange={handleChange}
                placeholder="Enter topic title"
                required
                className="w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={topicData.description}
                onChange={handleChange}
                placeholder="Topic description..."
                className="w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 min-h-24"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="price"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Price $:
                </Label>
                <div className="relative">

                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={topicData.price}
                    onChange={handleNumberChange}
                    placeholder="0.00"
                    className="pl-8 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div>
                <Label
                  htmlFor="regularPrice"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Regular Price $:
                </Label>
                <div className="relative">

                  <Input
                    id="regularPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={topicData.regularPrice}
                    onChange={handleNumberChange}
                    placeholder="0.00"
                    className="pl-8 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label
                htmlFor="subscriptionPeriod"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Subscription Period
              </Label>
              <Select
                onValueChange={handleSubscriptionPeriodChange}
                value={topicData.subscriptionPeriod}
              >
                <SelectTrigger
                  id="subscriptionPeriod"
                  className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                >
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="onetime">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              {/* <Label
                htmlFor="order"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Order
              </Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={topicData.order}
                onChange={handleNumberChange}
                placeholder="1"
                className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
              /> */}
              <p className="text-xs text-gray-500 mt-1">
                The order in which this topic appears in the subject
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-300 text-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Updating...
                </span>
              ) : (
                "Update Topic"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTopicDialog;
