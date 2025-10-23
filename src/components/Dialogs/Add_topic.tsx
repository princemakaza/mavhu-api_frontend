import React, { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import TopicInSubjectService from "@/services/Admin_Service/Topic_InSubject_service";
import { cn } from "@/lib/utils";

type AddTopicDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  onTopicAdded: () => void;
};

const defaultTopicData = {
  title: "",
  description: "",
  price: "" as number | string,           // keep as string during edit for better UX
  regularPrice: "" as number | string,    // keep as string during edit for better UX
  subscriptionPeriod: "",                 // force user to choose (required)
  order: 0,
};

const subscriptionOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "onetime", label: "One-time" },
];

const AddTopicDialog: React.FC<AddTopicDialogProps> = ({
  open,
  onOpenChange,
  subjectId,
  onTopicAdded,
}) => {
  const [topicData, setTopicData] = useState({ ...defaultTopicData });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setTopicData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    // Prevent negative, allow empty while typing
    if (value === "" || Number(value) >= 0) {
      setTopicData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubscriptionPeriodChange = (value: string) => {
    setTopicData((prev) => ({ ...prev, subscriptionPeriod: value }));
  };

  const parseMoney = (val: string | number) => {
    if (val === "" || val === null || val === undefined) return NaN;
    const n = typeof val === "number" ? val : Number(val);
    return Number.isFinite(n) ? n : NaN;
  };

  const validate = () => {
    const missing: string[] = [];

    if (!topicData.title.trim()) missing.push("Title");
    const priceNum = parseMoney(topicData.price);
    const regularPriceNum = parseMoney(topicData.regularPrice);
    if (Number.isNaN(priceNum)) missing.push("Price");
    if (Number.isNaN(regularPriceNum)) missing.push("Regular Price");
    if (!topicData.subscriptionPeriod) missing.push("Subscription Period");

    // Additional semantic checks (not marked “missing”, but still block submit)
    const semanticErrors: string[] = [];
    if (!Number.isNaN(priceNum) && priceNum < 0) {
      semanticErrors.push("Price cannot be negative.");
    }
    if (!Number.isNaN(regularPriceNum) && regularPriceNum < 0) {
      semanticErrors.push("Regular Price cannot be negative.");
    }
    if (
      !Number.isNaN(priceNum) &&
      !Number.isNaN(regularPriceNum) &&
      priceNum > regularPriceNum
    ) {
      semanticErrors.push("Price should not exceed Regular Price.");
    }

    if (missing.length > 0 || semanticErrors.length > 0) {
      const lines = [
        ...(missing.length
          ? [`Please complete the required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`]
          : []),
        ...semanticErrors,
      ];

      toast({
        variant: "destructive",
        title: "Can’t save topic yet",
        description: lines.join(" "),
        duration: 2000, // 2s highlight
      });
      return { ok: false };
    }

    return { ok: true, priceNum, regularPriceNum };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const result = validate();
    if (!result.ok) return;

    const { priceNum, regularPriceNum } = result as {
      priceNum: number;
      regularPriceNum: number;
    };

    setIsSubmitting(true);

    try {
      const apiTopicData = {
        title: topicData.title.trim(),
        description: topicData.description || "",
        subject: subjectId,
        subjectName: subjectId, // backend overrides
        showTopic: true,
        price: priceNum,
        regularPrice: regularPriceNum,
        subscriptionPeriod: topicData.subscriptionPeriod,
        order: Number(topicData.order) || 0,
      };

      await TopicInSubjectService.createTopic(apiTopicData);

      toast({
        title: "Topic created",
        description: "The topic has been added to this subject.",
        duration: 2000, // 2s success toast
      });

      setTopicData({ ...defaultTopicData });
      onOpenChange(false);
      onTopicAdded();
    } catch (error: any) {
      console.error("Failed to create topic:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create topic. Please try again.";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
        duration: 2000, // keep consistent
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[520px] mx-4 max-w-full">
      <DialogHeader>
        <DialogTitle>Add New Topic</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Topic Title<span className="text-destructive ml-1">*</span></Label>
          <Input
            id="title"
            value={topicData.title}
            onChange={handleChange}
            placeholder="Enter topic title"
            aria-required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={topicData.description}
            onChange={handleChange}
            placeholder="Topic description..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Price<span className="text-destructive ml-1">*</span></Label>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={topicData.price}
              onChange={handleNumberChange}
              placeholder="0.00"
              aria-required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="regularPrice">Regular Price<span className="text-destructive ml-1">*</span></Label>
            <Input
              id="regularPrice"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={topicData.regularPrice}
              onChange={handleNumberChange}
              placeholder="0.00"
              aria-required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="subscriptionPeriod">Subscription Period<span className="text-destructive ml-1">*</span></Label>
          <Select
            onValueChange={handleSubscriptionPeriodChange}
            value={topicData.subscriptionPeriod}
          >
            <SelectTrigger id="subscriptionPeriod" aria-required>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {subscriptionOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
{/* 
        <div className="grid gap-2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            min="0"
            value={topicData.order}
            onChange={handleNumberChange}
            placeholder="1"
          />
          <p className="text-xs text-muted-foreground">
            The order in which this topic appears in the subject
          </p>
        </div> */}

        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            variant="outline"
            className={cn("w-full sm:w-auto")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className={cn("w-full sm:w-auto")}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Add Topic"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default AddTopicDialog;
