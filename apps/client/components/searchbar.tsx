"use client";

import { useState } from "react";
import { AutoComplete } from "./autocomplete";
import { useQuery } from "@tanstack/react-query";

export default function SearchBar() {
  const [selectedValue, setSelectedValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["search"],
    queryFn: async () => {
      return [];
    },
  });

  return (
    <AutoComplete
      selectedValue={selectedValue}
      onSelectedValueChange={setSelectedValue}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      items={data ?? []}
      isLoading={isLoading}
      emptyMessage="No subcinders found"
    />
  );
}
