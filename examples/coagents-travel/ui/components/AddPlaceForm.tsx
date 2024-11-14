import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stars } from "@/components/Stars";
import { useState } from "react";

interface AddPlaceFormProps {
  onSubmit: (place: {
    name: string;
    description: string;
    address: string;
    rating: number;
  }) => void;
}

export function AddPlaceForm({ onSubmit }: AddPlaceFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = () => {
    onSubmit({
      name,
      description,
      address,
      rating
    });
    
    // Reset form
    setName("");
    setDescription("");
    setAddress("");
    setRating(0);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Place name</Label>
        <Input 
          id="name" 
          placeholder="Enter place name" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          className="border-gray-200"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        <Input 
          id="address" 
          placeholder="Enter address" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)}
          className="border-gray-200"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input 
          id="description" 
          placeholder="Enter description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          className="border-gray-200"
        />
      </div>
      <div className="grid gap-2">
        <Label>Rating</Label>
        <Stars
          rating={hoverRating || rating}
          interactive
          showNumber={false}
          onHover={setHoverRating}
          onRate={setRating}
        />
      </div>
      <Button 
        onClick={handleSubmit}
        className="mt-2 w-full bg-black text-white hover:bg-black/90"
      >
        Add Place
      </Button>
    </div>
  );
} 