"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { useContractStore } from "@/lib/store/contract-store";
import type { HotelContract, RoomRate } from "@/lib/schemas/contract-schema";
import { HotelContractSchema } from "@/lib/schemas/contract-schema";
import { toast } from "sonner";

export function ContractForm() {
  const { contract, updateContract } = useContractStore();
  const [localContract, setLocalContract] = useState<HotelContract | null>(contract);

  if (!contract || !localContract) {
    return (
      <Card className="flex items-center justify-center h-full min-h-[600px] bg-muted/30">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">No contract data</p>
          <p className="text-sm mt-2">Upload and process a contract to begin</p>
        </div>
      </Card>
    );
  }

  const handleFieldChange = (field: keyof HotelContract, value: any) => {
    const updated = { ...localContract, [field]: value };
    setLocalContract(updated);
    updateContract({ [field]: value });
  };

  const handleRoomRateChange = (index: number, field: keyof RoomRate, value: any) => {
    const updatedRates = [...localContract.roomRates];
    updatedRates[index] = { ...updatedRates[index], [field]: value };
    handleFieldChange("roomRates", updatedRates);
  };

  const addRoomRate = () => {
    const newRate: RoomRate = {
      roomType: "",
      season: "Low",
      rate: 0,
      mealPlan: "RO",
      currency: localContract.currency,
    };
    handleFieldChange("roomRates", [...localContract.roomRates, newRate]);
  };

  const deleteRoomRate = (index: number) => {
    const updatedRates = localContract.roomRates.filter((_, i) => i !== index);
    handleFieldChange("roomRates", updatedRates);
    toast.success("Room rate deleted");
  };

  const exportToJSON = () => {
    try {
      HotelContractSchema.parse(localContract);
      const blob = new Blob([JSON.stringify(localContract, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const hotelName = localContract?.hotelName || "contract";
      a.download = `${hotelName.replace(/\s+/g, "_")}_contract.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Contract exported as JSON");
    } catch (error) {
      toast.error("Validation failed. Please check all fields.");
    }
  };

  const exportToCSV = () => {
    if (!localContract || !localContract.roomRates || localContract.roomRates.length === 0) {
      toast.error("No room rates to export");
      return;
    }
    const headers = ["Room Type", "Season", "Rate", "Currency", "Meal Plan", "Valid From", "Valid To"];
    const rows = localContract.roomRates.map((rate) => [
      rate.roomType,
      rate.season,
      rate.rate,
      rate.currency,
      rate.mealPlan,
      rate.validFrom || "",
      rate.validTo || "",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const hotelName = localContract?.hotelName || "contract";
    a.download = `${hotelName.replace(/\s+/g, "_")}_rates.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Rates exported as CSV");
  };

  if (!localContract || Object.keys(localContract).length === 0) {
    return (
      <Card className="h-full overflow-auto flex items-center justify-center">
        <div className="text-center text-muted-foreground py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold">No Contract Data</p>
          <p className="text-sm mt-2">Upload a document to extract contract information</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold">Contract Details</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Review and edit extracted information
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button onClick={exportToJSON} variant="default" size="sm">
              <FileJson className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">General Information</h3>
          
          <div>
            <Label htmlFor="hotelName">Hotel Name</Label>
            <Input
              id="hotelName"
              value={localContract.hotelName}
              onChange={(e) => handleFieldChange("hotelName", e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractStartDate">Contract Start Date</Label>
              <Input
                id="contractStartDate"
                type="date"
                value={localContract.contractStartDate}
                onChange={(e) => handleFieldChange("contractStartDate", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="contractEndDate">Contract End Date</Label>
              <Input
                id="contractEndDate"
                type="date"
                value={localContract.contractEndDate}
                onChange={(e) => handleFieldChange("contractEndDate", e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={localContract.currency}
              onChange={(e) => handleFieldChange("currency", e.target.value)}
              className="mt-1.5"
              maxLength={3}
            />
          </div>

          <div>
            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
            <Textarea
              id="cancellationPolicy"
              value={localContract.cancellationPolicy || ""}
              onChange={(e) => handleFieldChange("cancellationPolicy", e.target.value)}
              className="mt-1.5"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Input
              id="paymentTerms"
              value={localContract.paymentTerms || ""}
              onChange={(e) => handleFieldChange("paymentTerms", e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Room Rates */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Room Rates</h3>
            <Button onClick={addRoomRate} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Rate
            </Button>
          </div>

          {(localContract?.roomRates || []).map((rate, index) => (
            <Card key={index} className="p-4 bg-muted/30">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Rate #{index + 1}</span>
                <Button
                  onClick={() => deleteRoomRate(index)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Room Type</Label>
                  <Input
                    value={rate.roomType}
                    onChange={(e) => handleRoomRateChange(index, "roomType", e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Season</Label>
                  <Select
                    value={rate.season}
                    onValueChange={(value) => handleRoomRateChange(index, "season", value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low Season</SelectItem>
                      <SelectItem value="Mid">Mid Season</SelectItem>
                      <SelectItem value="High">High Season</SelectItem>
                      <SelectItem value="Peak">Peak Season</SelectItem>
                      <SelectItem value="Year-round">Year-round</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Rate</Label>
                  <Input
                    type="number"
                    value={rate.rate}
                    onChange={(e) => handleRoomRateChange(index, "rate", parseFloat(e.target.value))}
                    className="mt-1.5"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label>Meal Plan</Label>
                  <Select
                    value={rate.mealPlan}
                    onValueChange={(value) => handleRoomRateChange(index, "mealPlan", value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RO">Room Only</SelectItem>
                      <SelectItem value="BB">Bed & Breakfast</SelectItem>
                      <SelectItem value="HB">Half Board</SelectItem>
                      <SelectItem value="FB">Full Board</SelectItem>
                      <SelectItem value="AI">All Inclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Valid From</Label>
                  <Input
                    type="date"
                    value={rate.validFrom || ""}
                    onChange={(e) => handleRoomRateChange(index, "validFrom", e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Valid To</Label>
                  <Input
                    type="date"
                    value={rate.validTo || ""}
                    onChange={(e) => handleRoomRateChange(index, "validTo", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
}
