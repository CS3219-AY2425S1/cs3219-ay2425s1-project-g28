import { render, screen } from "@testing-library/react";
import { faker } from "@faker-js/faker";

import ProfileDetails from ".";

faker.seed(0);

describe("Profile details", () => {
  it("First name and last name is rendered", () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.userName();
    const biography = faker.person.bio();
    render(
      <ProfileDetails
        firstName={firstName}
        lastName={lastName}
        username={username}
        biography={biography}
      />
    );
    expect(screen.getByText(`${firstName} ${lastName}`)).toBeInTheDocument();
  });

  it("Username is rendered", () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.userName();
    const biography = faker.person.bio();
    render(
      <ProfileDetails
        firstName={firstName}
        lastName={lastName}
        username={username}
        biography={biography}
      />
    );
    expect(screen.getByText(`@${username}`)).toBeInTheDocument();
  });
});
